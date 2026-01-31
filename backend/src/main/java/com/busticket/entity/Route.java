package com.busticket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Route entity representing travel routes between cities.
 * This is seeded data - read-only during runtime.
 */
@Entity
@Table(name = "routes", indexes = {
        @Index(name = "idx_route_source_dest", columnList = "source, destination")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String source;

    @Column(nullable = false, length = 100)
    private String destination;

    @Column(nullable = false)
    private Integer distance; // in kilometers

    @Column(name = "duration_hours", nullable = false)
    private Double durationHours;

    @Column(name = "base_fare", nullable = false)
    private Double baseFare;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<BusRoute> busRoutes = new HashSet<>();
}
