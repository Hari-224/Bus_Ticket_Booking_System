package com.busticket.service;

import com.busticket.dto.seat.SeatLayoutResponse;
import com.busticket.dto.seat.SeatLockRequest;
import com.busticket.dto.seat.SeatLockResponse;
import com.busticket.entity.Schedule;
import com.busticket.entity.Seat;
import com.busticket.entity.User;
import com.busticket.exception.BadRequestException;
import com.busticket.exception.ResourceNotFoundException;
import com.busticket.exception.SeatNotAvailableException;
import com.busticket.repository.ScheduleRepository;
import com.busticket.repository.SeatRepository;
import com.busticket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatService {

    private final SeatRepository seatRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    @Value("${seat.lock.expiry.minutes:5}")
    private int lockExpiryMinutes;

    @Transactional(readOnly = true)
    public SeatLayoutResponse getSeatLayout(Long scheduleId) {
        Schedule schedule = scheduleRepository.findByIdWithDetails(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", "id", scheduleId));

        List<Seat> seats = seatRepository.findByScheduleIdOrderByRowNumberAscColumnNumberAsc(scheduleId);

        // Get current user ID if authenticated
        Long currentUserId = getCurrentUserIdOrNull();

        // Count seat statuses
        int availableSeats = 0;
        int bookedSeats = 0;
        int lockedSeats = 0;

        for (Seat seat : seats) {
            switch (seat.getStatus()) {
                case AVAILABLE -> availableSeats++;
                case BOOKED -> bookedSeats++;
                case LOCKED -> lockedSeats++;
            }
        }

        List<SeatLayoutResponse.SeatDto> seatDtos = seats.stream()
                .map(seat -> mapToSeatDto(seat, currentUserId))
                .collect(Collectors.toList());

        return SeatLayoutResponse.builder()
                .scheduleId(scheduleId)
                .busNumber(schedule.getBusRoute().getBus().getBusNumber())
                .busName(schedule.getBusRoute().getBus().getBusName())
                .totalSeats(schedule.getBusRoute().getBus().getTotalSeats())
                .availableSeats(availableSeats)
                .bookedSeats(bookedSeats)
                .lockedSeats(lockedSeats)
                .seatsPerRow(schedule.getBusRoute().getBus().getSeatsPerRow())
                .seats(seatDtos)
                .build();
    }

    @Transactional
    public SeatLockResponse lockSeats(SeatLockRequest request) {
        User user = getCurrentUser();

        // Validate schedule
        scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", "id", request.getScheduleId()));

        // Release any existing locks by this user
        List<Seat> existingLocks = seatRepository.findLockedSeatsByUserId(user.getId());
        for (Seat seat : existingLocks) {
            seat.setStatus(Seat.SeatStatus.AVAILABLE);
            seat.setLockedByUser(null);
            seat.setLockExpiryTime(null);
        }

        // Get seats with pessimistic lock to prevent race conditions
        List<Seat> seats = seatRepository.findByIdsWithPessimisticLock(request.getSeatIds());

        if (seats.size() != request.getSeatIds().size()) {
            throw new ResourceNotFoundException("Some seats were not found");
        }

        // Validate all seats are available
        LocalDateTime now = LocalDateTime.now();
        for (Seat seat : seats) {
            if (seat.getStatus() == Seat.SeatStatus.BOOKED) {
                throw new SeatNotAvailableException(seat.getSeatNumber(), "already booked");
            }
            if (seat.getStatus() == Seat.SeatStatus.LOCKED && !seat.isLockExpired()
                    && !seat.getLockedByUser().getId().equals(user.getId())) {
                throw new SeatNotAvailableException(seat.getSeatNumber(), "temporarily locked by another user");
            }
        }

        // Lock seats
        LocalDateTime lockExpiry = now.plusMinutes(lockExpiryMinutes);
        double totalFare = 0;

        for (Seat seat : seats) {
            seat.setStatus(Seat.SeatStatus.LOCKED);
            seat.setLockedByUser(user);
            seat.setLockExpiryTime(lockExpiry);
            totalFare += seat.getFare();
        }

        seatRepository.saveAll(seats);

        log.info("User {} locked {} seats for schedule {}", user.getEmail(), seats.size(), request.getScheduleId());

        return SeatLockResponse.builder()
                .scheduleId(request.getScheduleId())
                .lockedSeats(seats.stream().map(Seat::getSeatNumber).collect(Collectors.toList()))
                .totalFare(totalFare)
                .lockExpiryTime(lockExpiry)
                .lockDurationSeconds((long) lockExpiryMinutes * 60)
                .message("Seats locked successfully. Complete booking within " + lockExpiryMinutes + " minutes.")
                .build();
    }

    @Transactional
    public void releaseSeats(Long scheduleId, List<Long> seatIds) {
        User user = getCurrentUser();

        List<Seat> seats = seatRepository.findByIdsWithPessimisticLock(seatIds);

        for (Seat seat : seats) {
            if (seat.getStatus() == Seat.SeatStatus.LOCKED
                    && seat.getLockedByUser() != null
                    && seat.getLockedByUser().getId().equals(user.getId())) {
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                seat.setLockedByUser(null);
                seat.setLockExpiryTime(null);
            }
        }

        seatRepository.saveAll(seats);
        log.info("User {} released {} seats", user.getEmail(), seatIds.size());
    }

    private SeatLayoutResponse.SeatDto mapToSeatDto(Seat seat, Long currentUserId) {
        boolean isLockedByCurrentUser = seat.getLockedByUser() != null
                && currentUserId != null
                && seat.getLockedByUser().getId().equals(currentUserId);

        // If lock has expired, treat as available
        Seat.SeatStatus effectiveStatus = seat.getStatus();
        if (seat.getStatus() == Seat.SeatStatus.LOCKED && seat.isLockExpired()) {
            effectiveStatus = Seat.SeatStatus.AVAILABLE;
        }

        return SeatLayoutResponse.SeatDto.builder()
                .id(seat.getId())
                .seatNumber(seat.getSeatNumber())
                .rowNumber(seat.getRowNumber())
                .columnNumber(seat.getColumnNumber())
                .seatType(seat.getSeatType())
                .status(effectiveStatus)
                .fare(seat.getFare())
                .isLockedByCurrentUser(isLockedByCurrentUser)
                .build();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private Long getCurrentUserIdOrNull() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            if (email == null || email.equals("anonymousUser")) {
                return null;
            }
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}
