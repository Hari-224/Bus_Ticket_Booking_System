package com.busticket.service;

import com.busticket.dto.booking.*;
import com.busticket.entity.*;
import com.busticket.exception.*;
import com.busticket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final PassengerRepository passengerRepository;
    private final PaymentRepository paymentRepository;

    @Value("${seat.lock.expiry.minutes:5}")
    private int lockExpiryMinutes;

    private static final String DUMMY_PAYMENT_PASSWORD = "pay123";

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request) {
        User user = getCurrentUser();

        // Validate schedule
        Schedule schedule = scheduleRepository.findByIdWithDetails(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", "id", request.getScheduleId()));

        // Check if journey date is valid
        if (schedule.getJourneyDate().isBefore(LocalDate.now())) {
            throw new BookingException("Cannot book for past dates");
        }

        // Validate seat count matches passenger count
        if (request.getSeatIds().size() != request.getPassengers().size()) {
            throw new BookingException("Number of seats must match number of passengers");
        }

        // Get seats with pessimistic lock
        List<Seat> seats = seatRepository.findByIdsWithPessimisticLock(request.getSeatIds());

        if (seats.size() != request.getSeatIds().size()) {
            throw new ResourceNotFoundException("Some seats were not found");
        }

        // Validate seats are locked by current user
        for (Seat seat : seats) {
            if (seat.getStatus() != Seat.SeatStatus.LOCKED) {
                throw new SeatNotAvailableException(seat.getSeatNumber(), "not locked. Please select seats first.");
            }
            if (seat.getLockedByUser() == null || !seat.getLockedByUser().getId().equals(user.getId())) {
                throw new SeatNotAvailableException(seat.getSeatNumber(), "locked by another user");
            }
            if (seat.isLockExpired()) {
                throw new SeatNotAvailableException(seat.getSeatNumber(),
                        "lock has expired. Please select seats again.");
            }
        }

        // Calculate fare
        double totalFare = seats.stream().mapToDouble(Seat::getFare).sum();

        // Generate PNR
        String pnr = generatePnr();

        // Create booking
        Booking booking = Booking.builder()
                .pnr(pnr)
                .user(user)
                .schedule(schedule)
                .status(Booking.BookingStatus.PENDING)
                .totalSeats(seats.size())
                .totalFare(totalFare)
                .discountAmount(0.0)
                .finalAmount(totalFare)
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .bookingExpiryTime(LocalDateTime.now().plusMinutes(lockExpiryMinutes))
                .build();

        booking = bookingRepository.save(booking);

        // Update seats with booking reference
        for (Seat seat : seats) {
            seat.setBooking(booking);
        }
        seatRepository.saveAll(seats);

        // Create passengers
        List<Passenger> passengers = new ArrayList<>();
        boolean primarySet = false;
        for (CreateBookingRequest.PassengerDto passengerDto : request.getPassengers()) {
            Passenger passenger = Passenger.builder()
                    .booking(booking)
                    .name(passengerDto.getName())
                    .age(passengerDto.getAge())
                    .gender(passengerDto.getGender())
                    .seatNumber(passengerDto.getSeatNumber())
                    .isPrimary(!primarySet)
                    .status(Passenger.PassengerStatus.ACTIVE)
                    .build();
            passengers.add(passenger);
            primarySet = true;
        }
        passengerRepository.saveAll(passengers);

        log.info("Booking created: PNR={} by user={}", pnr, user.getEmail());

        return getBookingByPnr(pnr);
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        User user = getCurrentUser();

        // Find booking
        Booking booking = bookingRepository.findByPnrWithDetails(request.getPnr())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "PNR", request.getPnr()));

        // Validate booking belongs to user
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new BookingException("Booking not found");
        }

        // Validate booking status
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BookingException("Booking is not in pending state");
        }

        // Check if booking has expired
        if (booking.getBookingExpiryTime() != null && LocalDateTime.now().isAfter(booking.getBookingExpiryTime())) {
            // Expire booking and release seats
            expireBooking(booking);
            throw new BookingException("Booking has expired. Please start a new booking.");
        }

        // Generate transaction ID
        String transactionId = generateTransactionId();

        // Simulate payment - check dummy password
        boolean paymentSuccess = DUMMY_PAYMENT_PASSWORD.equals(request.getPaymentPassword());

        // Create payment record
        Payment payment = Payment.builder()
                .booking(booking)
                .transactionId(transactionId)
                .amount(booking.getFinalAmount())
                .paymentMethod(Payment.PaymentMethod.DUMMY)
                .status(paymentSuccess ? Payment.PaymentStatus.SUCCESS : Payment.PaymentStatus.FAILED)
                .paymentTime(LocalDateTime.now())
                .failureReason(paymentSuccess ? null : "Invalid payment password")
                .build();

        paymentRepository.save(payment);

        if (paymentSuccess) {
            // Confirm booking
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            booking.setConfirmedAt(LocalDateTime.now());
            booking.setBookingExpiryTime(null);

            // Update seats to BOOKED
            List<Seat> seats = seatRepository.findByBookingId(booking.getId());
            for (Seat seat : seats) {
                seat.setStatus(Seat.SeatStatus.BOOKED);
                seat.setLockExpiryTime(null);
            }
            seatRepository.saveAll(seats);

            // Update schedule available seats
            Schedule schedule = booking.getSchedule();
            schedule.setAvailableSeats(schedule.getAvailableSeats() - seats.size());
            scheduleRepository.save(schedule);

            log.info("Payment successful: PNR={}, TransactionId={}", request.getPnr(), transactionId);
        } else {
            // Release seats
            expireBooking(booking);
            log.info("Payment failed: PNR={}, TransactionId={}", request.getPnr(), transactionId);
        }

        bookingRepository.save(booking);

        return PaymentResponse.builder()
                .transactionId(transactionId)
                .pnr(request.getPnr())
                .amount(booking.getFinalAmount())
                .status(payment.getStatus())
                .paymentTime(payment.getPaymentTime())
                .message(paymentSuccess ? "Payment successful! Your booking is confirmed."
                        : "Payment failed. Please try again.")
                .booking(paymentSuccess ? getBookingByPnr(request.getPnr()) : null)
                .build();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByPnr(String pnr) {
        Booking booking = bookingRepository.findByPnrWithDetails(pnr)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "PNR", pnr));

        return mapToBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public BookingResponse verifyAndGetBooking(TicketVerificationRequest request) {
        Booking booking = bookingRepository.findByPnrWithDetails(request.getPnr())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "PNR", request.getPnr()));

        boolean emailMatch = request.getEmail() != null && !request.getEmail().isEmpty() &&
                request.getEmail().equalsIgnoreCase(booking.getContactEmail());

        boolean mobileMatch = request.getMobile() != null && !request.getMobile().isEmpty() &&
                request.getMobile().equals(booking.getContactPhone());

        if (!emailMatch && !mobileMatch) {
            throw new BadRequestException(
                    "Invalid details. Please provide correct registered Email or Mobile number matching the PNR.");
        }

        return mapToBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyTrips() {
        User user = getCurrentUser();
        List<Booking> bookings = bookingRepository.findByUserIdWithDetails(user.getId());
        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CancelBookingResponse cancelBooking(CancelBookingRequest request) {
        User user = getCurrentUser();

        Booking booking = bookingRepository.findByPnrWithDetails(request.getPnr())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "PNR", request.getPnr()));

        // Validate booking belongs to user
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new BookingException("Booking not found");
        }

        // Validate booking can be cancelled
        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new BookingException("Only confirmed bookings can be cancelled");
        }

        // Check if journey has started
        if (LocalDateTime.now().isAfter(booking.getSchedule().getDepartureDateTime())) {
            throw new BookingException("Cannot cancel after journey has started");
        }

        // Calculate refund based on time before departure
        double refundPercentage = calculateRefundPercentage(booking.getSchedule().getDepartureDateTime());

        boolean isFullCancellation = request.getPassengerIdsToCancel() == null
                || request.getPassengerIdsToCancel().isEmpty();

        int cancelledCount;
        double refundAmount;

        if (isFullCancellation) {
            // Full cancellation
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            booking.setCancelledAt(LocalDateTime.now());
            booking.setCancellationReason(request.getReason());
            refundAmount = booking.getFinalAmount() * refundPercentage;
            booking.setRefundAmount(refundAmount);

            // Release all seats
            List<Seat> seats = seatRepository.findByBookingId(booking.getId());
            for (Seat seat : seats) {
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                seat.setBooking(null);
                seat.setLockedByUser(null);
            }
            seatRepository.saveAll(seats);

            // Update schedule available seats
            Schedule schedule = booking.getSchedule();
            schedule.setAvailableSeats(schedule.getAvailableSeats() + seats.size());
            scheduleRepository.save(schedule);

            // Cancel all passengers
            List<Passenger> passengers = passengerRepository.findByBookingId(booking.getId());
            passengers.forEach(p -> p.setStatus(Passenger.PassengerStatus.CANCELLED));
            passengerRepository.saveAll(passengers);

            cancelledCount = passengers.size();
            log.info("Full cancellation: PNR={}, Refund={}", request.getPnr(), refundAmount);
        } else {
            // Partial cancellation
            List<Passenger> toCancel = passengerRepository.findAllById(request.getPassengerIdsToCancel());

            // Validate passengers belong to this booking
            for (Passenger p : toCancel) {
                if (!p.getBooking().getId().equals(booking.getId())) {
                    throw new BookingException("Invalid passenger ID");
                }
            }

            // Calculate per-seat fare
            double perSeatFare = booking.getFinalAmount() / booking.getTotalSeats();
            refundAmount = perSeatFare * toCancel.size() * refundPercentage;

            // Cancel passengers and release their seats
            List<String> seatNumbers = toCancel.stream()
                    .map(Passenger::getSeatNumber)
                    .collect(Collectors.toList());

            List<Seat> seatsToRelease = seatRepository.findByScheduleIdAndSeatNumbers(
                    booking.getSchedule().getId(), seatNumbers);

            for (Seat seat : seatsToRelease) {
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                seat.setBooking(null);
                seat.setLockedByUser(null);
            }
            seatRepository.saveAll(seatsToRelease);

            // Update schedule
            Schedule schedule = booking.getSchedule();
            schedule.setAvailableSeats(schedule.getAvailableSeats() + seatsToRelease.size());
            scheduleRepository.save(schedule);

            // Cancel passengers
            toCancel.forEach(p -> p.setStatus(Passenger.PassengerStatus.CANCELLED));
            passengerRepository.saveAll(toCancel);

            // Update booking
            booking.setStatus(Booking.BookingStatus.PARTIALLY_CANCELLED);
            booking.setRefundAmount((booking.getRefundAmount() != null ? booking.getRefundAmount() : 0) + refundAmount);

            cancelledCount = toCancel.size();
            log.info("Partial cancellation: PNR={}, Cancelled={} passengers, Refund={}",
                    request.getPnr(), cancelledCount, refundAmount);
        }

        // Update payment status
        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        if (payment != null) {
            payment.setStatus(
                    isFullCancellation ? Payment.PaymentStatus.REFUNDED : Payment.PaymentStatus.PARTIALLY_REFUNDED);
            paymentRepository.save(payment);
        }

        bookingRepository.save(booking);

        return CancelBookingResponse.builder()
                .pnr(request.getPnr())
                .status(booking.getStatus().name())
                .cancelledPassengers(cancelledCount)
                .refundAmount(refundAmount)
                .message(String.format(
                        "Cancellation successful. Refund of ₹%.2f will be processed within 5-7 business days.",
                        refundAmount))
                .build();
    }

    private void expireBooking(Booking booking) {
        booking.setStatus(Booking.BookingStatus.EXPIRED);

        // Release seats
        List<Seat> seats = seatRepository.findByBookingId(booking.getId());
        for (Seat seat : seats) {
            seat.setStatus(Seat.SeatStatus.AVAILABLE);
            seat.setBooking(null);
            seat.setLockedByUser(null);
            seat.setLockExpiryTime(null);
        }
        seatRepository.saveAll(seats);
    }

    private double calculateRefundPercentage(LocalDateTime departureTime) {
        long hoursUntilDeparture = java.time.Duration.between(LocalDateTime.now(), departureTime).toHours();

        if (hoursUntilDeparture >= 48) {
            return 0.95; // 95% refund
        } else if (hoursUntilDeparture >= 24) {
            return 0.75; // 75% refund
        } else if (hoursUntilDeparture >= 6) {
            return 0.50; // 50% refund
        } else {
            return 0.25; // 25% refund
        }
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        Schedule schedule = booking.getSchedule();
        Bus bus = schedule.getBusRoute().getBus();
        Route route = schedule.getBusRoute().getRoute();
        Driver driver = schedule.getBusRoute().getDriver();

        // Get passengers
        List<Passenger> passengers = passengerRepository.findByBookingId(booking.getId());

        // Get seat numbers
        List<Seat> seats = seatRepository.findByBookingId(booking.getId());
        List<String> seatNumbers = seats.stream()
                .map(Seat::getSeatNumber)
                .collect(Collectors.toList());

        // Build amenities
        List<String> amenities = new ArrayList<>();
        if (bus.getIsAc())
            amenities.add("AC");
        if (bus.getHasWifi())
            amenities.add("WiFi");
        if (bus.getHasCharging())
            amenities.add("Charging Point");
        if (bus.getHasToilet())
            amenities.add("Toilet");

        return BookingResponse.builder()
                .id(booking.getId())
                .pnr(booking.getPnr())
                .status(booking.getStatus())
                .bookingTime(booking.getCreatedAt())
                .bookingExpiryTime(booking.getBookingExpiryTime())
                .journey(BookingResponse.JourneyDto.builder()
                        .source(route.getSource())
                        .destination(route.getDestination())
                        .departureTime(schedule.getDepartureDateTime())
                        .arrivalTime(schedule.getArrivalDateTime())
                        .durationHours(route.getDurationHours())
                        .build())
                .bus(BookingResponse.BusDto.builder()
                        .id(bus.getId())
                        .busNumber(bus.getBusNumber())
                        .busName(bus.getBusName())
                        .busType(bus.getBusType())
                        .operatorName(bus.getOperatorName())
                        .amenities(amenities)
                        .build())
                .driver(BookingResponse.DriverDto.builder()
                        .id(driver.getId())
                        .name(driver.getName())
                        .phoneNumber(driver.getPhoneNumber())
                        .build())
                .passengers(passengers.stream()
                        .map(p -> BookingResponse.PassengerDto.builder()
                                .id(p.getId())
                                .name(p.getName())
                                .age(p.getAge())
                                .gender(p.getGender())
                                .seatNumber(p.getSeatNumber())
                                .status(p.getStatus())
                                .build())
                        .collect(Collectors.toList()))
                .seatNumbers(seatNumbers)
                .fare(BookingResponse.FareDto.builder()
                        .baseFare(booking.getTotalFare())
                        .totalFare(booking.getTotalFare())
                        .discountAmount(booking.getDiscountAmount())
                        .finalAmount(booking.getFinalAmount())
                        .build())
                .contactEmail(booking.getContactEmail())
                .contactPhone(booking.getContactPhone())
                .build();
    }

    private String generatePnr() {
        String pnr;
        do {
            pnr = "BT" + System.currentTimeMillis() % 100000000;
        } while (bookingRepository.existsByPnr(pnr));
        return pnr;
    }

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
