package com.busticket.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Passenger entity representing individual passengers in a booking.
 */
@Entity
@Table(name = "passengers", indexes = {
        @Index(name = "idx_passenger_booking", columnList = "booking_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Passenger extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    @Column(name = "seat_number", nullable = false, length = 10)
    private String seatNumber;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PassengerStatus status = PassengerStatus.ACTIVE;

    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }

    public enum PassengerStatus {
        ACTIVE,
        CANCELLED
    }
}
