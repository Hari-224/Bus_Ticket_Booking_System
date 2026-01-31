package com.busticket.dto.search;

import com.busticket.entity.Bus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponse {

    private String source;
    private String destination;
    private LocalDate journeyDate;
    private int totalBuses;
    private List<BusScheduleDto> buses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusScheduleDto {
        private Long scheduleId;
        private Long busId;
        private String busNumber;
        private String busName;
        private Bus.BusType busType;
        private String operatorName;
        private LocalDateTime departureTime;
        private LocalDateTime arrivalTime;
        private Double durationHours;
        private Integer totalSeats;
        private Integer availableSeats;
        private Double baseFare;
        private Double fare;
        private List<String> amenities;
        private DriverDto driver;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DriverDto {
        private Long id;
        private String name;
        private Integer experienceYears;
    }
}
