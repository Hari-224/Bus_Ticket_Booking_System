package com.busticket.service;

import com.busticket.dto.ai.BookingSummaryDto;
import com.busticket.entity.Booking;
import com.busticket.entity.User;
import com.busticket.repository.BookingRepository;
import com.busticket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingCalculatorService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    private static final Pattern PNR_PATTERN = Pattern.compile("\\b[A-Za-z0-9]{6,12}\\b");
    private static final Pattern MINS_PATTERN = Pattern.compile("(?:after|in)?\\s*(\\d+)\\s*(?:minutes?|mins?)", Pattern.CASE_INSENSITIVE);
    private static final Pattern HOURS_PATTERN = Pattern.compile("(?:after|in)?\\s*(\\d+)\\s*(?:hours?|hrs?)", Pattern.CASE_INSENSITIVE);
    private static final Pattern DAYS_PATTERN = Pattern.compile("(?:after|in)?\\s*(\\d+)\\s*(?:days?|d)", Pattern.CASE_INSENSITIVE);

    private static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public boolean isPersonalizedQuery(String question) {
        if (question == null) return false;
        String q = question.toLowerCase();
        return q.contains("cancel") || q.contains("refund") || q.contains("eligible") ||
                q.contains("charge") || q.contains("my ticket") || q.contains("my booking") ||
                q.contains("how much") || q.contains("amount");
    }

    public BookingSummaryDto calculatePersonalizedRefund(String question) {
        log.info("Analyzing query for personalized booking refund calculation: '{}'", question);

        Booking booking = resolveTargetBooking(question);
        if (booking == null) {
            log.info("No matching target booking found for query: '{}'", question);
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime simulatedTime = parseSimulatedTime(question, now);
        LocalDateTime departureTime = booking.getSchedule().getDepartureDateTime();

        double bookingAmount = booking.getFinalAmount();
        double refundRatio;
        double cancellationFeePercent;
        double cancellationCharge;
        double refundAmount;
        boolean isEligible;
        String policyTier;
        String reason;

        if (!simulatedTime.isBefore(departureTime)) {
            // Post-departure
            refundRatio = 0.0;
            cancellationFeePercent = 100.0;
            cancellationCharge = bookingAmount;
            refundAmount = 0.0;
            isEligible = false;
            policyTier = "Post-Departure (Non-Refundable)";
            reason = String.format("The requested cancellation time (%s) is after the bus departure (%s). Post-departure cancellations are non-refundable.",
                    simulatedTime.format(DISPLAY_FORMATTER), departureTime.format(DISPLAY_FORMATTER));
        } else {
            long hoursUntilDeparture = Duration.between(simulatedTime, departureTime).toHours();
            long minsUntilDeparture = Duration.between(simulatedTime, departureTime).toMinutes();

            if (hoursUntilDeparture >= 24) {
                refundRatio = 0.90;
                cancellationFeePercent = 10.0;
                policyTier = "More than 24 hours prior (90% refund)";
                reason = String.format("Cancellation is %d hours before departure, which falls in the >24 hour cancellation policy window (90%% refund).", hoursUntilDeparture);
            } else if (hoursUntilDeparture >= 12) {
                refundRatio = 0.75;
                cancellationFeePercent = 25.0;
                policyTier = "12 to 24 hours prior (75% refund)";
                reason = String.format("Cancellation is %d hours before departure, which falls in the 12–24 hour cancellation policy window (75%% refund).", hoursUntilDeparture);
            } else if (hoursUntilDeparture >= 2) {
                refundRatio = 0.50;
                cancellationFeePercent = 50.0;
                policyTier = "2 to 12 hours prior (50% refund)";
                reason = String.format("Cancellation is %d hours before departure, which falls in the 2–12 hour cancellation policy window (50%% refund).", hoursUntilDeparture);
            } else {
                refundRatio = 0.0;
                cancellationFeePercent = 100.0;
                policyTier = "Less than 2 hours prior (Non-Refundable)";
                reason = String.format("Cancellation is %d minutes before departure, which falls in the <2 hour policy window (Non-refundable).", minsUntilDeparture);
            }

            cancellationCharge = Math.round((bookingAmount * (1.0 - refundRatio)) * 100.0) / 100.0;
            refundAmount = Math.round((bookingAmount * refundRatio) * 100.0) / 100.0;
            isEligible = refundAmount > 0;
        }

        String route = booking.getSchedule().getBusRoute().getRoute().getSource() + " → " +
                booking.getSchedule().getBusRoute().getRoute().getDestination();

        return BookingSummaryDto.builder()
                .pnr(booking.getPnr())
                .route(route)
                .departureTime(departureTime.format(DISPLAY_FORMATTER))
                .simulatedCancelTime(simulatedTime.format(DISPLAY_FORMATTER))
                .bookingAmount(bookingAmount)
                .cancellationCharge(cancellationCharge)
                .cancellationFeePercentage(cancellationFeePercent)
                .refundAmount(refundAmount)
                .refundEligibility(isEligible)
                .refundProcessingTime("3 to 5 business days")
                .applicablePolicy(policyTier)
                .reason(reason)
                .build();
    }

    private Booking resolveTargetBooking(String question) {
        // 1. Look for explicit PNR pattern in question
        Matcher matcher = PNR_PATTERN.matcher(question);
        while (matcher.find()) {
            String candidatePnr = matcher.group();
            Optional<Booking> pnrBooking = bookingRepository.findByPnrWithDetails(candidatePnr.toUpperCase());
            if (pnrBooking.isPresent()) {
                log.info("Resolved booking from query PNR: {}", candidatePnr);
                return pnrBooking.get();
            }
        }

        // 2. Look for current authenticated user's confirmed bookings
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String email = auth.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                List<Booking> userBookings = bookingRepository.findByUserIdWithDetails(userOpt.get().getId());
                Optional<Booking> activeBooking = userBookings.stream()
                        .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED || b.getStatus() == Booking.BookingStatus.PARTIALLY_CANCELLED)
                        .findFirst();
                if (activeBooking.isPresent()) {
                    log.info("Resolved active booking for authenticated user {}: PNR={}", email, activeBooking.get().getPnr());
                    return activeBooking.get();
                }
            }
        }

        return null;
    }

    private LocalDateTime parseSimulatedTime(String question, LocalDateTime now) {
        String q = question.toLowerCase();

        Matcher minsMatcher = MINS_PATTERN.matcher(q);
        if (minsMatcher.find()) {
            int mins = Integer.parseInt(minsMatcher.group(1));
            return now.plusMinutes(mins);
        }

        Matcher hoursMatcher = HOURS_PATTERN.matcher(q);
        if (hoursMatcher.find()) {
            int hrs = Integer.parseInt(hoursMatcher.group(1));
            return now.plusHours(hrs);
        }

        Matcher daysMatcher = DAYS_PATTERN.matcher(q);
        if (daysMatcher.find()) {
            int days = Integer.parseInt(daysMatcher.group(1));
            return now.plusDays(days);
        }

        if (q.contains("tomorrow morning")) {
            return now.plusDays(1).withHour(9).withMinute(0);
        } else if (q.contains("tomorrow afternoon")) {
            return now.plusDays(1).withHour(14).withMinute(0);
        } else if (q.contains("tomorrow evening") || q.contains("tomorrow night")) {
            return now.plusDays(1).withHour(19).withMinute(0);
        } else if (q.contains("tomorrow")) {
            return now.plusDays(1);
        }

        return now;
    }
}
