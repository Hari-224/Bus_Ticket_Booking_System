package com.busticket.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Driver entity representing bus drivers.
 * This is seeded data - read-only during runtime.
 */
@Entity
@Table(name = "drivers", indexes = {
        @Index(name = "idx_driver_license", columnList = "license_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "license_number", nullable = false, unique = true, length = 20)
    private String licenseNumber;

    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber;

    @Column(name = "experience_years", nullable = false)
    private Integer experienceYears;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
