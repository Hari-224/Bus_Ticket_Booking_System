package com.busticket.scheduler;

import com.busticket.entity.*;
import com.busticket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Scheduler for managing the 7-day circular schedule system.
 * Runs daily at midnight to rotate schedules.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduleRotationScheduler {

    private final BusRouteRepository busRouteRepository;
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;

    /**
     * Rotates the 7-day schedule by:
     * 1. Marking yesterday's schedules as completed
     * 2. Creating new schedules for the 7th day ahead
     */
    @Scheduled(cron = "0 5 0 * * *") // At 00:05 every day
    @Transactional
    public void rotateSchedules() {
        log.info("Starting daily schedule rotation...");

        LocalDate today = LocalDate.now();
        LocalDate day7Ahead = today.plusDays(6);

        List<BusRoute> activeBusRoutes = busRouteRepository.findAllActive();

        int created = 0;
        for (BusRoute busRoute : activeBusRoutes) {
            // Check if schedule already exists for day 7
            if (!scheduleRepository.existsByBusRouteIdAndJourneyDate(busRoute.getId(), day7Ahead)) {
                // Create schedule for day 7
                Schedule schedule = createScheduleForDate(busRoute, day7Ahead);
                scheduleRepository.save(schedule);

                // Create seats for the new schedule
                createSeatsForSchedule(schedule, busRoute.getBus());
                created++;
            }
        }

        log.info("Schedule rotation complete. Created {} new schedules for {}", created, day7Ahead);
    }

    private Schedule createScheduleForDate(BusRoute busRoute, LocalDate date) {
        LocalDateTime departureDateTime = LocalDateTime.of(date, busRoute.getDepartureTime());
        LocalDateTime arrivalDateTime = LocalDateTime.of(date, busRoute.getArrivalTime());

        // Handle overnight journeys
        if (busRoute.getArrivalTime().isBefore(busRoute.getDepartureTime())) {
            arrivalDateTime = arrivalDateTime.plusDays(1);
        }

        return Schedule.builder()
                .busRoute(busRoute)
                .journeyDate(date)
                .slotIndex(date.getDayOfWeek().getValue() % 7)
                .availableSeats(busRoute.getBus().getTotalSeats())
                .departureDateTime(departureDateTime)
                .arrivalDateTime(arrivalDateTime)
                .status(Schedule.ScheduleStatus.ACTIVE)
                .build();
    }

    private void createSeatsForSchedule(Schedule schedule, Bus bus) {
        int totalSeats = bus.getTotalSeats();
        int seatsPerRow = bus.getSeatsPerRow();
        double baseFare = schedule.getBusRoute().getRoute().getBaseFare()
                * schedule.getBusRoute().getFareMultiplier();

        for (int i = 1; i <= totalSeats; i++) {
            int rowNum = (i - 1) / seatsPerRow + 1;
            int colNum = (i - 1) % seatsPerRow + 1;

            // Determine seat type based on position
            Seat.SeatType seatType;
            if (bus.getBusType() == Bus.BusType.SLEEPER || bus.getBusType() == Bus.BusType.AC_SLEEPER) {
                seatType = (rowNum % 2 == 0) ? Seat.SeatType.SLEEPER_UPPER : Seat.SeatType.SLEEPER_LOWER;
            } else if (colNum == 1 || colNum == seatsPerRow) {
                seatType = Seat.SeatType.WINDOW;
            } else {
                seatType = Seat.SeatType.AISLE;
            }

            // Window seats have slightly higher fare
            double fare = baseFare;
            if (seatType == Seat.SeatType.WINDOW) {
                fare = baseFare * 1.05;
            } else if (seatType == Seat.SeatType.SLEEPER_LOWER) {
                fare = baseFare * 1.10;
            }

            String seatNumber = String.format("%d%c", rowNum, (char) ('A' + colNum - 1));

            Seat seat = Seat.builder()
                    .schedule(schedule)
                    .seatNumber(seatNumber)
                    .rowNumber(rowNum)
                    .columnNumber(colNum)
                    .seatType(seatType)
                    .status(Seat.SeatStatus.AVAILABLE)
                    .fare(Math.round(fare * 100.0) / 100.0)
                    .build();

            seatRepository.save(seat);
        }
    }
}
