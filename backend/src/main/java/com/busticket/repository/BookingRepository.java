package com.busticket.repository;

import com.busticket.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByPnr(String pnr);

    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.schedule s " +
            "JOIN FETCH s.busRoute br " +
            "JOIN FETCH br.bus " +
            "JOIN FETCH br.route " +
            "JOIN FETCH br.driver " +
            "WHERE b.pnr = :pnr")
    Optional<Booking> findByPnrWithDetails(@Param("pnr") String pnr);

    @Query("SELECT b FROM Booking b " +
            "JOIN FETCH b.schedule s " +
            "JOIN FETCH s.busRoute br " +
            "JOIN FETCH br.bus " +
            "JOIN FETCH br.route " +
            "WHERE b.user.id = :userId ORDER BY s.journeyDate DESC, s.departureDateTime DESC")
    List<Booking> findByUserIdWithDetails(@Param("userId") Long userId);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.bookingExpiryTime < :now")
    List<Booking> findExpiredPendingBookings(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Booking b SET b.status = 'EXPIRED' WHERE b.status = 'PENDING' AND b.bookingExpiryTime < :now")
    int expirePendingBookings(@Param("now") LocalDateTime now);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = :status ORDER BY b.createdAt DESC")
    List<Booking> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Booking.BookingStatus status);

    @Query("SELECT b FROM Booking b " +
            "JOIN b.schedule s " +
            "WHERE b.user.id = :userId AND b.status = 'CONFIRMED' AND s.journeyDate >= CURRENT_DATE " +
            "ORDER BY s.journeyDate ASC")
    List<Booking> findUpcomingBookings(@Param("userId") Long userId);

    @Query("SELECT b FROM Booking b " +
            "JOIN b.schedule s " +
            "WHERE b.user.id = :userId AND b.status = 'CONFIRMED' AND s.journeyDate < CURRENT_DATE " +
            "ORDER BY s.journeyDate DESC")
    List<Booking> findPastBookings(@Param("userId") Long userId);

    boolean existsByPnr(String pnr);
}
