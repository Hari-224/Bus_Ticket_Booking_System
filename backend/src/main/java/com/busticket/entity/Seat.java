package com.busticket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "seats", indexes = {
        @Index(name = "idx_seat_schedule", columnList = "schedule_id"),
        @Index(name = "idx_seat_status", columnList = "status"),
        @Index(name = "idx_seat_lock_expiry", columnList = "lock_expiry_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @Column(name = "seat_number", nullable = false, length = 10)
    private String seatNumber;

    @Column(name = "seat_row", nullable = false)
    private Integer rowNumber;

    @Column(name = "seat_column", nullable = false)
    private Integer columnNumber;
    

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false, length = 20)
    @Builder.Default
    private SeatType seatType = SeatType.REGULAR;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SeatStatus status = SeatStatus.AVAILABLE;

    @Column(name = "fare", nullable = false)
    private Double fare;

    // Lock-related fields
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locked_by_user_id")
    private User lockedByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(name = "lock_expiry_time")
    private LocalDateTime lockExpiryTime;

    @Version
    private Long version; // For optimistic locking

    public enum SeatStatus {
        AVAILABLE,
        LOCKED,
        BOOKED
    }

    public enum SeatType {
        REGULAR,
        WINDOW,
        AISLE,
        SLEEPER_LOWER,
        SLEEPER_UPPER
    }

    /**
     * Check if the seat lock has expired.
     */
    public boolean isLockExpired() {
        return lockExpiryTime != null && LocalDateTime.now().isAfter(lockExpiryTime);
    }
}
