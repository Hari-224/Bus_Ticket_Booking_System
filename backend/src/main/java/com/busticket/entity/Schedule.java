package com.busticket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Schedule entity representing daily bus schedules.
 * Part of the 7-day circular schedule system.
 */
@Entity
@Table(name = "schedules", indexes = {
        @Index(name = "idx_schedule_date", columnList = "journey_date"),
        @Index(name = "idx_schedule_bus_route_date", columnList = "bus_route_id, journey_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_route_id", nullable = false)
    private BusRoute busRoute;

    @Column(name = "journey_date", nullable = false)
    private LocalDate journeyDate;

    @Column(name = "slot_index", nullable = false)
    private Integer slotIndex; // 0-6 for 7-day rotation

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    @Column(name = "departure_datetime", nullable = false)
    private LocalDateTime departureDateTime;

    @Column(name = "arrival_datetime", nullable = false)
    private LocalDateTime arrivalDateTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ScheduleStatus status = ScheduleStatus.ACTIVE;

    @Version
    private Long version; // For optimistic locking

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Seat> seats = new HashSet<>();

    public enum ScheduleStatus {
        ACTIVE,
        COMPLETED,
        CANCELLED
    }
}
