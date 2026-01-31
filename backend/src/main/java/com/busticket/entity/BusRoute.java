package com.busticket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

/**
 * Bus-Route mapping entity.
 * Defines which buses operate on which routes with timing.
 * This is seeded data - read-only during runtime.
 */
@Entity
@Table(name = "bus_routes", indexes = {
        @Index(name = "idx_bus_route", columnList = "bus_id, route_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusRoute extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(name = "departure_time", nullable = false)
    private LocalTime departureTime;

    @Column(name = "arrival_time", nullable = false)
    private LocalTime arrivalTime;

    @Column(name = "fare_multiplier", nullable = false)
    @Builder.Default
    private Double fareMultiplier = 1.0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
