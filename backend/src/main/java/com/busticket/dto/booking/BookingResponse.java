package com.busticket.dto.booking;

import com.busticket.entity.Booking;
import com.busticket.entity.Bus;
import com.busticket.entity.Passenger;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;
    private String pnr;
    private Booking.BookingStatus status;
    private LocalDateTime bookingTime;
    private LocalDateTime bookingExpiryTime;

    // Journey Details
    private JourneyDto journey;

    // Bus Details
    private BusDto bus;

    // Driver Details
    private DriverDto driver;

    // Passengers
    private List<PassengerDto> passengers;

    // Seats
    private List<String> seatNumbers;

    // Fare Details
    private FareDto fare;

    // Contact Details
    private String contactEmail;
    private String contactPhone;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JourneyDto {
        private String source;
        private String destination;
        private LocalDateTime departureTime;
        private LocalDateTime arrivalTime;
        private Double durationHours;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusDto {
        private Long id;
        private String busNumber;
        private String busName;
        private Bus.BusType busType;
        private String operatorName;
        private List<String> amenities;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DriverDto {
        private Long id;
        private String name;
        private String phoneNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerDto {
        private Long id;
        private String name;
        private Integer age;
        private Passenger.Gender gender;
        private String seatNumber;
        private Passenger.PassengerStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FareDto {
        private Double baseFare;
        private Double totalFare;
        private Double discountAmount;
        private Double finalAmount;
    }
}
