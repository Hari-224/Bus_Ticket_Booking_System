package com.busticket.dto.booking;

import com.busticket.entity.Passenger;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotNull(message = "Schedule ID is required")
    private Long scheduleId;

    @NotEmpty(message = "At least one seat must be selected")
    private List<Long> seatIds;

    @NotEmpty(message = "Passenger details are required")
    @Valid
    private List<PassengerDto> passengers;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Please provide a valid email address")
    private String contactEmail;

    @NotBlank(message = "Contact phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String contactPhone;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerDto {

        @NotBlank(message = "Passenger name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;

        @NotNull(message = "Age is required")
        @Min(value = 1, message = "Age must be at least 1")
        @Max(value = 120, message = "Age must be at most 120")
        private Integer age;

        @NotNull(message = "Gender is required")
        private Passenger.Gender gender;

        @NotBlank(message = "Seat number is required")
        private String seatNumber;
    }
}
