package com.busticket.repository;

import com.busticket.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByScheduleIdOrderByRowNumberAscColumnNumberAsc(Long scheduleId);

    @Query("SELECT s FROM Seat s WHERE s.schedule.id = :scheduleId AND s.status = 'AVAILABLE' ORDER BY s.rowNumber, s.columnNumber")
    List<Seat> findAvailableSeatsByScheduleId(@Param("scheduleId") Long scheduleId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id = :seatId")
    Optional<Seat> findByIdWithPessimisticLock(@Param("seatId") Long seatId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id IN :seatIds")
    List<Seat> findByIdsWithPessimisticLock(@Param("seatIds") List<Long> seatIds);

    @Query("SELECT s FROM Seat s WHERE s.status = 'LOCKED' AND s.lockExpiryTime < :now")
    List<Seat> findExpiredLockedSeats(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Seat s SET s.status = 'AVAILABLE', s.lockedByUser = null, s.lockExpiryTime = null " +
            "WHERE s.status = 'LOCKED' AND s.lockExpiryTime < :now")
    int releaseExpiredLocks(@Param("now") LocalDateTime now);

    @Query("SELECT s FROM Seat s WHERE s.schedule.id = :scheduleId AND s.seatNumber IN :seatNumbers")
    List<Seat> findByScheduleIdAndSeatNumbers(@Param("scheduleId") Long scheduleId,
            @Param("seatNumbers") List<String> seatNumbers);

    @Query("SELECT COUNT(s) FROM Seat s WHERE s.schedule.id = :scheduleId AND s.status = 'AVAILABLE'")
    int countAvailableSeats(@Param("scheduleId") Long scheduleId);

    @Query("SELECT s FROM Seat s WHERE s.booking.id = :bookingId")
    List<Seat> findByBookingId(@Param("bookingId") Long bookingId);

    @Query("SELECT s FROM Seat s WHERE s.lockedByUser.id = :userId AND s.status = 'LOCKED'")
    List<Seat> findLockedSeatsByUserId(@Param("userId") Long userId);
}
