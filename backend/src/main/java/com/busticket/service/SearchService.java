package com.busticket.service;

import com.busticket.dto.search.SearchResponse;
import com.busticket.entity.Bus;
import com.busticket.entity.Route;
import com.busticket.entity.Schedule;
import com.busticket.exception.BadRequestException;
import com.busticket.repository.RouteRepository;
import com.busticket.repository.ScheduleRepository;
import com.busticket.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final RouteRepository routeRepository;
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;

    @Transactional(readOnly = true)
    public SearchResponse searchBuses(String source, String destination, LocalDate journeyDate) {
        // Validate journey date (Today to next 6 days)
        LocalDate today = LocalDate.now();
        LocalDate maxDate = today.plusDays(6);

        if (journeyDate.isBefore(today)) {
            throw new BadRequestException("Journey date cannot be in the past");
        }

        if (journeyDate.isAfter(maxDate)) {
            throw new BadRequestException("Journey date cannot be more than 6 days from today");
        }

        // For uncovered source-destination pairs, return an empty result instead of 404.
        Route route = routeRepository.findBySourceAndDestinationIgnoreCase(source, destination)
            .orElse(null);

        if (route == null) {
            return SearchResponse.builder()
                .source(source)
                .destination(destination)
                .journeyDate(journeyDate)
                .totalBuses(0)
                .buses(List.of())
                .build();
        }

        // Find schedules for this route and date
        List<Schedule> schedules = scheduleRepository.findByRouteIdAndJourneyDate(route.getId(), journeyDate);

        List<SearchResponse.BusScheduleDto> busSchedules = schedules.stream()
                .map(this::mapToScheduleDto)
                .collect(Collectors.toList());

        return SearchResponse.builder()
                .source(source)
                .destination(destination)
                .journeyDate(journeyDate)
                .totalBuses(busSchedules.size())
                .buses(busSchedules)
                .build();
    }

    private SearchResponse.BusScheduleDto mapToScheduleDto(Schedule schedule) {
        Bus bus = schedule.getBusRoute().getBus();
        Route route = schedule.getBusRoute().getRoute();

        // Count available seats
        int availableSeats = seatRepository.countAvailableSeats(schedule.getId());

        // Build amenities list
        List<String> amenities = new ArrayList<>();
        if (bus.getIsAc())
            amenities.add("AC");
        if (bus.getHasWifi())
            amenities.add("WiFi");
        if (bus.getHasCharging())
            amenities.add("Charging Point");
        if (bus.getHasToilet())
            amenities.add("Toilet");

        return SearchResponse.BusScheduleDto.builder()
                .scheduleId(schedule.getId())
                .busId(bus.getId())
                .busNumber(bus.getBusNumber())
                .busName(bus.getBusName())
                .busType(bus.getBusType())
                .operatorName(bus.getOperatorName())
                .departureTime(schedule.getDepartureDateTime())
                .arrivalTime(schedule.getArrivalDateTime())
                .durationHours(route.getDurationHours())
                .totalSeats(bus.getTotalSeats())
                .availableSeats(availableSeats)
                .baseFare(route.getBaseFare())
                .fare(route.getBaseFare() * schedule.getBusRoute().getFareMultiplier())
                .amenities(amenities)
                .driver(SearchResponse.DriverDto.builder()
                        .id(schedule.getBusRoute().getDriver().getId())
                        .name(schedule.getBusRoute().getDriver().getName())
                        .experienceYears(schedule.getBusRoute().getDriver().getExperienceYears())
                        .build())
                .build();
    }
}
