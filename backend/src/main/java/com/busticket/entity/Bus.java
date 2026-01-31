package com.busticket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Bus entity representing individual buses.
 * This is seeded data - read-only during runtime.
 */
@Entity
@Table(name = "buses", indexes = {
        @Index(name = "idx_bus_number", columnList = "bus_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bus extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_number", nullable = false, unique = true, length = 20)
    private String busNumber;

    @Column(name = "bus_name", nullable = false, length = 100)
    private String busName;

    @Enumerated(EnumType.STRING)
    @Column(name = "bus_type", nullable = false, length = 20)
    private BusType busType;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(name = "seats_per_row", nullable = false)
    @Builder.Default
    private Integer seatsPerRow = 4;

    @Column(name = "operator_name", nullable = false, length = 100)
    private String operatorName;

    @Column(name = "has_wifi")
    @Builder.Default
    private Boolean hasWifi = false;

    @Column(name = "has_charging")
    @Builder.Default
    private Boolean hasCharging = false;

    @Column(name = "has_toilet")
    @Builder.Default
    private Boolean hasToilet = false;

    @Column(name = "is_ac")
    @Builder.Default
    private Boolean isAc = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "bus", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<BusRoute> busRoutes = new HashSet<>();

    public enum BusType {
        SLEEPER,
        SEMI_SLEEPER,
        SEATER,
        AC_SLEEPER,
        AC_SEATER,
        VOLVO_AC
    }
}
