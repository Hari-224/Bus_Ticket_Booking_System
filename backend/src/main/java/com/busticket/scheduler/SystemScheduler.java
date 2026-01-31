package com.busticket.scheduler;

import com.busticket.repository.BookingRepository;
import com.busticket.repository.ScheduleRepository;
import com.busticket.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Scheduled tasks for maintaining system integrity.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SystemScheduler {

    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;

    /**
     * Release expired seat locks every minute.
     */
    @Scheduled(fixedRate = 60000) // Every 1 minute
    @Transactional
    public void releaseExpiredSeatLocks() {
        int released = seatRepository.releaseExpiredLocks(LocalDateTime.now());
        if (released > 0) {
            log.info("Released {} expired seat locks", released);
        }
    }

    /**
     * Expire pending bookings that have passed their expiry time.
     * Runs every 2 minutes.
     */
    @Scheduled(fixedRate = 120000) // Every 2 minutes
    @Transactional
    public void expirePendingBookings() {
        int expired = bookingRepository.expirePendingBookings(LocalDateTime.now());
        if (expired > 0) {
            log.info("Expired {} pending bookings", expired);
        }
    }

    /**
     * Mark past schedules as completed.
     * Runs daily at midnight.
     */
    @Scheduled(cron = "0 0 0 * * *") // At midnight every day
    @Transactional
    public void markPastSchedulesAsCompleted() {
        int completed = scheduleRepository.markPastSchedulesAsCompleted(LocalDate.now());
        if (completed > 0) {
            log.info("Marked {} past schedules as completed", completed);
        }
    }
}
