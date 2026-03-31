package com.busticket.seeder;

import com.busticket.entity.*;
import com.busticket.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

/**
 * Database seeder for populating initial data.
 * Seeds Routes, Buses, Drivers, BusRoutes, and initial 7-day Schedules.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DatabaseSeeder implements CommandLineRunner {

    private final RouteRepository routeRepository;
    private final BusRepository busRepository;
    private final DriverRepository driverRepository;
    private final BusRouteRepository busRouteRepository;
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;

    @Override
    @Transactional
    public void run(String... args) {
                if (routeRepository.count() == 0) {
                        log.info("Starting initial database seeding...");

                        // Seed Routes
                        List<Route> routes = seedRoutes();
                        log.info("Seeded {} routes", routes.size());

                        // Seed Drivers
                        List<Driver> drivers = seedDrivers();
                        log.info("Seeded {} drivers", drivers.size());

                        // Seed Buses
                        List<Bus> buses = seedBuses();
                        log.info("Seeded {} buses", buses.size());

                        // Seed BusRoutes
                        List<BusRoute> busRoutes = seedBusRoutes(routes, buses, drivers);
                        log.info("Seeded {} bus-route mappings", busRoutes.size());

                        // Seed 7-day schedules
                        int scheduleCount = seedSchedules(busRoutes);
                        log.info("Seeded {} schedules with seats", scheduleCount);
                } else {
                        log.info("Core seed data already exists. Running route/schedule sync...");
                }

                ensureAllCityRoutesHaveBuses();
                log.info("Database seeding/sync completed successfully!");
    }

        private void ensureAllCityRoutesHaveBuses() {
                List<Route> activeRoutes = routeRepository.findByIsActiveTrue();
                List<Bus> activeBuses = busRepository.findByIsActiveTrue();
                List<Driver> activeDrivers = driverRepository.findByIsActiveTrue();

                if (activeRoutes.isEmpty() || activeBuses.isEmpty() || activeDrivers.isEmpty()) {
                        log.warn("Skipping route coverage sync due to missing active routes/buses/drivers");
                        return;
                }

                Set<String> cities = new TreeSet<>();
                activeRoutes.forEach(route -> {
                        cities.add(route.getSource());
                        cities.add(route.getDestination());
                });

                Map<String, Route> routeByKey = new HashMap<>();
                for (Route route : activeRoutes) {
                        routeByKey.put(routeKey(route.getSource(), route.getDestination()), route);
                }

                List<Route> missingRoutes = new ArrayList<>();
                for (String source : cities) {
                        for (String destination : cities) {
                                if (source.equalsIgnoreCase(destination)) {
                                        continue;
                                }

                                String key = routeKey(source, destination);
                                if (routeByKey.containsKey(key)) {
                                        continue;
                                }

                                Route generatedRoute = createGeneratedRoute(source, destination);
                                missingRoutes.add(generatedRoute);
                                routeByKey.put(key, generatedRoute);
                        }
                }

                if (!missingRoutes.isEmpty()) {
                        routeRepository.saveAll(missingRoutes);
                        log.info("Added {} missing city pair routes", missingRoutes.size());
                }

                List<Route> allRoutes = routeRepository.findByIsActiveTrue();
                List<BusRoute> newBusRoutes = new ArrayList<>();
                int rotationIndex = 0;

                for (Route route : allRoutes) {
                        if (!busRouteRepository.findByRouteAndIsActiveTrue(route).isEmpty()) {
                                continue;
                        }

                        Bus bus = activeBuses.get(rotationIndex % activeBuses.size());
                        Driver driver = activeDrivers.get(rotationIndex % activeDrivers.size());

                        LocalTime departure = LocalTime.of((5 + (rotationIndex * 3) % 18), (rotationIndex % 2) * 30);
                        int travelMinutes = Math.max(120, (int) Math.round(route.getDurationHours() * 60));
                        LocalTime arrival = departure.plusMinutes(travelMinutes);

                        double fareMultiplier = 1.0 + (rotationIndex % 3) * 0.05;
                        newBusRoutes.add(createBusRoute(bus, route, driver, departure, arrival, fareMultiplier));
                        rotationIndex++;
                }

                if (!newBusRoutes.isEmpty()) {
                        busRouteRepository.saveAll(newBusRoutes);
                        log.info("Added {} missing bus-route mappings", newBusRoutes.size());
                }

                int schedulesAdded = ensureUpcomingSchedules(busRouteRepository.findAllActive());
                log.info("Ensured schedules for next 7 days. Added {} new schedules", schedulesAdded);
        }

        private String routeKey(String source, String destination) {
                return source.toLowerCase(Locale.ROOT) + "->" + destination.toLowerCase(Locale.ROOT);
        }

        private Route createGeneratedRoute(String source, String destination) {
                int hash = Math.abs(Objects.hash(source.toLowerCase(Locale.ROOT), destination.toLowerCase(Locale.ROOT)));

                int distance = 220 + (hash % 1480); // 220km to 1699km
                double averageSpeed = 58 + (hash % 13); // 58 to 70 km/h
                double durationHours = Math.round((distance / averageSpeed) * 10.0) / 10.0;
                double baseFare = Math.round(Math.max(300.0, (distance * 1.45) + (hash % 120)) * 100.0) / 100.0;

                return Route.builder()
                                .source(source)
                                .destination(destination)
                                .distance(distance)
                                .durationHours(durationHours)
                                .baseFare(baseFare)
                                .isActive(true)
                                .build();
        }

        private int ensureUpcomingSchedules(List<BusRoute> busRoutes) {
                LocalDate today = LocalDate.now();
                int createdCount = 0;

                for (BusRoute busRoute : busRoutes) {
                        for (int day = 0; day < 7; day++) {
                                LocalDate journeyDate = today.plusDays(day);
                                if (scheduleRepository.existsByBusRouteIdAndJourneyDate(busRoute.getId(), journeyDate)) {
                                        continue;
                                }

                                Schedule schedule = createSchedule(busRoute, journeyDate, day);
                                schedule = scheduleRepository.save(schedule);
                                createSeats(schedule, busRoute.getBus());
                                createdCount++;
                        }
                }

                return createdCount;
        }

    private List<Route> seedRoutes() {
        List<Route> routes = Arrays.asList(
                Route.builder()
                        .source("Mumbai")
                        .destination("Pune")
                        .distance(150)
                        .durationHours(3.5)
                        .baseFare(350.0)
                        .isActive(true)
                        .build(),
                Route.builder()
                        .source("Mumbai")
                        .destination("Bangalore")
                        .distance(980)
                        .durationHours(14.0)
                        .baseFare(1200.0)
                        .isActive(true)
                        .build(),
                Route.builder()
                        .source("Delhi")
                        .destination("Jaipur")
                        .distance(280)
                        .durationHours(5.5)
                        .baseFare(450.0)
                        .isActive(true)
                        .build(),
                Route.builder()
                        .source("Delhi")
                        .destination("Agra")
                        .distance(210)
                        .durationHours(4.0)
                        .baseFare(350.0)
                        .isActive(true)
                        .build(),
                Route.builder()
                        .source("Bangalore")
                        .destination("Chennai")
                        .distance(350)
                        .durationHours(6.0)
                        .baseFare(550.0)
                        .isActive(true)
                        .build(),
                Route.builder()
                        .source("Hyderabad")
                        .destination("Bangalore")
                        .distance(570)
                        .durationHours(9.0)
                        .baseFare(800.0)
                        .isActive(true)
                        .build(),
                Route.builder()
                        .source("Chennai")
                        .destination("Hyderabad")
                        .distance(630)
                        .durationHours(10.0)
                        .baseFare(900.0)
                        .isActive(true)
                        .build(),
                Route.builder()
                        .source("Pune")
                        .destination("Goa")
                        .distance(450)
                        .durationHours(8.0)
                        .baseFare(700.0)
                        .isActive(true)
                        .build(),
                Route.builder()
                        .source("Kolkata")
                        .destination("Bhubaneswar")
                        .distance(440)
                        .durationHours(7.5)
                        .baseFare(650.0)
                        .isActive(true)
                        .build(),
                Route.builder()
                        .source("Ahmedabad")
                        .destination("Mumbai")
                        .distance(520)
                        .durationHours(8.5)
                        .baseFare(750.0)
                        .isActive(true)
                        .build());

        return routeRepository.saveAll(routes);
    }

    private List<Driver> seedDrivers() {
        List<Driver> drivers = Arrays.asList(
                Driver.builder().name("Rajesh Kumar").licenseNumber("DL1234567890").phoneNumber("9876543210")
                        .experienceYears(12).isActive(true).build(),
                Driver.builder().name("Suresh Patil").licenseNumber("MH1234567891").phoneNumber("9876543211")
                        .experienceYears(8).isActive(true).build(),
                Driver.builder().name("Mahesh Sharma").licenseNumber("KA1234567892").phoneNumber("9876543212")
                        .experienceYears(15).isActive(true).build(),
                Driver.builder().name("Ramesh Yadav").licenseNumber("TN1234567893").phoneNumber("9876543213")
                        .experienceYears(10).isActive(true).build(),
                Driver.builder().name("Ganesh Reddy").licenseNumber("AP1234567894").phoneNumber("9876543214")
                        .experienceYears(7).isActive(true).build(),
                Driver.builder().name("Dinesh Singh").licenseNumber("RJ1234567895").phoneNumber("9876543215")
                        .experienceYears(9).isActive(true).build(),
                Driver.builder().name("Mukesh Verma").licenseNumber("UP1234567896").phoneNumber("9876543216")
                        .experienceYears(11).isActive(true).build(),
                Driver.builder().name("Lokesh Nair").licenseNumber("KL1234567897").phoneNumber("9876543217")
                        .experienceYears(6).isActive(true).build(),
                Driver.builder().name("Rakesh Joshi").licenseNumber("GJ1234567898").phoneNumber("9876543218")
                        .experienceYears(14).isActive(true).build(),
                Driver.builder().name("Prakash Menon").licenseNumber("WB1234567899").phoneNumber("9876543219")
                        .experienceYears(13).isActive(true).build(),
                Driver.builder().name("Naresh Pillai").licenseNumber("OR1234567800").phoneNumber("9876543220")
                        .experienceYears(5).isActive(true).build(),
                Driver.builder().name("Hitesh Pandey").licenseNumber("MP1234567801").phoneNumber("9876543221")
                        .experienceYears(8).isActive(true).build(),
                Driver.builder().name("Jitesh Iyer").licenseNumber("TG1234567802").phoneNumber("9876543222")
                        .experienceYears(10).isActive(true).build(),
                Driver.builder().name("Ritesh Choudhary").licenseNumber("BR1234567803").phoneNumber("9876543223")
                        .experienceYears(7).isActive(true).build(),
                Driver.builder().name("Mitesh Agarwal").licenseNumber("HR1234567804").phoneNumber("9876543224")
                        .experienceYears(9).isActive(true).build());

        return driverRepository.saveAll(drivers);
    }

    private List<Bus> seedBuses() {
        List<Bus> buses = Arrays.asList(
                Bus.builder().busNumber("MH01AB1234").busName("Shivneri Express").busType(Bus.BusType.VOLVO_AC)
                        .totalSeats(40).seatsPerRow(4).operatorName("MSRTC").hasWifi(true).hasCharging(true)
                        .hasToilet(true).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("MH02CD5678").busName("Neeta Travels").busType(Bus.BusType.AC_SLEEPER)
                        .totalSeats(30).seatsPerRow(3).operatorName("Neeta Travels").hasWifi(true).hasCharging(true)
                        .hasToilet(true).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("KA03EF9012").busName("VRL Travels").busType(Bus.BusType.VOLVO_AC)
                        .totalSeats(44).seatsPerRow(4).operatorName("VRL Travels").hasWifi(true).hasCharging(true)
                        .hasToilet(true).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("TN04GH3456").busName("SRS Travels").busType(Bus.BusType.AC_SEATER)
                        .totalSeats(48).seatsPerRow(4).operatorName("SRS Travels").hasWifi(false).hasCharging(true)
                        .hasToilet(false).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("AP05IJ7890").busName("Orange Tours").busType(Bus.BusType.SLEEPER)
                        .totalSeats(36).seatsPerRow(3).operatorName("Orange Tours").hasWifi(false).hasCharging(true)
                        .hasToilet(true).isAc(false).isActive(true).build(),
                Bus.builder().busNumber("RJ06KL2345").busName("RSRTC Volvo").busType(Bus.BusType.VOLVO_AC)
                        .totalSeats(40).seatsPerRow(4).operatorName("RSRTC").hasWifi(true).hasCharging(true)
                        .hasToilet(true).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("UP07MN6789").busName("Hans Travels").busType(Bus.BusType.SEMI_SLEEPER)
                        .totalSeats(36).seatsPerRow(4).operatorName("Hans Travels").hasWifi(false).hasCharging(true)
                        .hasToilet(false).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("GJ08OP1234").busName("Eagle Travels").busType(Bus.BusType.AC_SLEEPER)
                        .totalSeats(30).seatsPerRow(3).operatorName("Eagle Travels").hasWifi(true).hasCharging(true)
                        .hasToilet(true).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("WB09QR5678").busName("Shyamoli Travels").busType(Bus.BusType.SEATER)
                        .totalSeats(52).seatsPerRow(4).operatorName("Shyamoli Travels").hasWifi(false)
                        .hasCharging(false).hasToilet(false).isAc(false).isActive(true).build(),
                Bus.builder().busNumber("KL10ST9012").busName("KSRTC Super").busType(Bus.BusType.VOLVO_AC)
                        .totalSeats(44).seatsPerRow(4).operatorName("KSRTC").hasWifi(true).hasCharging(true)
                        .hasToilet(true).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("TG11UV3456").busName("Kaveri Travels").busType(Bus.BusType.AC_SLEEPER)
                        .totalSeats(32).seatsPerRow(3).operatorName("Kaveri Travels").hasWifi(true).hasCharging(true)
                        .hasToilet(true).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("OR12WX7890").busName("OSRTC Deluxe").busType(Bus.BusType.AC_SEATER)
                        .totalSeats(40).seatsPerRow(4).operatorName("OSRTC").hasWifi(false).hasCharging(true)
                        .hasToilet(true).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("MH13YZ2345").busName("Paulo Travels").busType(Bus.BusType.VOLVO_AC)
                        .totalSeats(40).seatsPerRow(4).operatorName("Paulo Travels").hasWifi(true).hasCharging(true)
                        .hasToilet(true).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("KA14AB6789").busName("Sugama Travels").busType(Bus.BusType.SEMI_SLEEPER)
                        .totalSeats(36).seatsPerRow(4).operatorName("Sugama Travels").hasWifi(false).hasCharging(true)
                        .hasToilet(false).isAc(true).isActive(true).build(),
                Bus.builder().busNumber("DL15CD1234").busName("Zing Bus").busType(Bus.BusType.VOLVO_AC).totalSeats(40)
                        .seatsPerRow(4).operatorName("Zing Bus").hasWifi(true).hasCharging(true).hasToilet(true)
                        .isAc(true).isActive(true).build());

        return busRepository.saveAll(buses);
    }

    private List<BusRoute> seedBusRoutes(List<Route> routes, List<Bus> buses, List<Driver> drivers) {
        List<BusRoute> busRoutes = new ArrayList<>();

        // Create bus-route mappings with varied timings
        // Route 0: Mumbai - Pune (3 buses, different timings)
        busRoutes.add(createBusRoute(buses.get(0), routes.get(0), drivers.get(0), LocalTime.of(6, 0),
                LocalTime.of(9, 30), 1.0));
        busRoutes.add(createBusRoute(buses.get(1), routes.get(0), drivers.get(1), LocalTime.of(10, 0),
                LocalTime.of(13, 30), 1.1));
        busRoutes.add(createBusRoute(buses.get(12), routes.get(0), drivers.get(2), LocalTime.of(18, 0),
                LocalTime.of(21, 30), 1.0));

        // Route 1: Mumbai - Bangalore (2 buses, overnight)
        busRoutes.add(createBusRoute(buses.get(2), routes.get(1), drivers.get(3), LocalTime.of(18, 0),
                LocalTime.of(8, 0), 1.0));
        busRoutes.add(createBusRoute(buses.get(7), routes.get(1), drivers.get(4), LocalTime.of(20, 0),
                LocalTime.of(10, 0), 1.15));

        // Route 2: Delhi - Jaipur (2 buses)
        busRoutes.add(createBusRoute(buses.get(5), routes.get(2), drivers.get(5), LocalTime.of(7, 0),
                LocalTime.of(12, 30), 1.0));
        busRoutes.add(createBusRoute(buses.get(14), routes.get(2), drivers.get(6), LocalTime.of(14, 0),
                LocalTime.of(19, 30), 1.0));

        // Route 3: Delhi - Agra (2 buses)
        busRoutes.add(createBusRoute(buses.get(6), routes.get(3), drivers.get(7), LocalTime.of(6, 30),
                LocalTime.of(10, 30), 1.0));
        busRoutes.add(createBusRoute(buses.get(14), routes.get(3), drivers.get(8), LocalTime.of(15, 0),
                LocalTime.of(19, 0), 1.05));

        // Route 4: Bangalore - Chennai (2 buses)
        busRoutes.add(createBusRoute(buses.get(3), routes.get(4), drivers.get(9), LocalTime.of(7, 0),
                LocalTime.of(13, 0), 1.0));
        busRoutes.add(createBusRoute(buses.get(10), routes.get(4), drivers.get(10), LocalTime.of(22, 0),
                LocalTime.of(4, 0), 1.0));

        // Route 5: Hyderabad - Bangalore (2 buses)
        busRoutes.add(createBusRoute(buses.get(4), routes.get(5), drivers.get(11), LocalTime.of(21, 0),
                LocalTime.of(6, 0), 1.0));
        busRoutes.add(createBusRoute(buses.get(10), routes.get(5), drivers.get(12), LocalTime.of(22, 30),
                LocalTime.of(7, 30), 1.1));

        // Route 6: Chennai - Hyderabad (1 bus)
        busRoutes.add(createBusRoute(buses.get(3), routes.get(6), drivers.get(13), LocalTime.of(20, 0),
                LocalTime.of(6, 0), 1.0));

        // Route 7: Pune - Goa (2 buses)
        busRoutes.add(createBusRoute(buses.get(12), routes.get(7), drivers.get(0), LocalTime.of(22, 0),
                LocalTime.of(6, 0), 1.0));
        busRoutes.add(createBusRoute(buses.get(1), routes.get(7), drivers.get(1), LocalTime.of(23, 0),
                LocalTime.of(7, 0), 1.2));

        // Route 8: Kolkata - Bhubaneswar (1 bus)
        busRoutes.add(createBusRoute(buses.get(8), routes.get(8), drivers.get(14), LocalTime.of(21, 0),
                LocalTime.of(4, 30), 1.0));

        // Route 9: Ahmedabad - Mumbai (2 buses)
        busRoutes.add(createBusRoute(buses.get(7), routes.get(9), drivers.get(2), LocalTime.of(21, 0),
                LocalTime.of(5, 30), 1.0));
        busRoutes.add(createBusRoute(buses.get(13), routes.get(9), drivers.get(3), LocalTime.of(22, 30),
                LocalTime.of(7, 0), 1.0));

        return busRouteRepository.saveAll(busRoutes);
    }

    private BusRoute createBusRoute(Bus bus, Route route, Driver driver, LocalTime departure, LocalTime arrival,
            double fareMultiplier) {
        return BusRoute.builder()
                .bus(bus)
                .route(route)
                .driver(driver)
                .departureTime(departure)
                .arrivalTime(arrival)
                .fareMultiplier(fareMultiplier)
                .isActive(true)
                .build();
    }

    private int seedSchedules(List<BusRoute> busRoutes) {
        LocalDate today = LocalDate.now();
        int count = 0;

        for (BusRoute busRoute : busRoutes) {
            for (int day = 0; day < 7; day++) {
                LocalDate date = today.plusDays(day);

                Schedule schedule = createSchedule(busRoute, date, day);
                schedule = scheduleRepository.save(schedule);

                createSeats(schedule, busRoute.getBus());
                count++;
            }
        }

        return count;
    }

    private Schedule createSchedule(BusRoute busRoute, LocalDate date, int slotIndex) {
        LocalDateTime departureDateTime = LocalDateTime.of(date, busRoute.getDepartureTime());
        LocalDateTime arrivalDateTime = LocalDateTime.of(date, busRoute.getArrivalTime());

        // Handle overnight journeys
        if (busRoute.getArrivalTime().isBefore(busRoute.getDepartureTime())) {
            arrivalDateTime = arrivalDateTime.plusDays(1);
        }

        return Schedule.builder()
                .busRoute(busRoute)
                .journeyDate(date)
                .slotIndex(slotIndex)
                .availableSeats(busRoute.getBus().getTotalSeats())
                .departureDateTime(departureDateTime)
                .arrivalDateTime(arrivalDateTime)
                .status(Schedule.ScheduleStatus.ACTIVE)
                .build();
    }

    private void createSeats(Schedule schedule, Bus bus) {
        int totalSeats = bus.getTotalSeats();
        int seatsPerRow = bus.getSeatsPerRow();
        double baseFare = schedule.getBusRoute().getRoute().getBaseFare()
                * schedule.getBusRoute().getFareMultiplier();

        List<Seat> seats = new ArrayList<>();

        for (int i = 1; i <= totalSeats; i++) {
            int rowNum = (i - 1) / seatsPerRow + 1;
            int colNum = (i - 1) % seatsPerRow + 1;

            Seat.SeatType seatType = determineSeatType(bus.getBusType(), rowNum, colNum, seatsPerRow);
            double fare = calculateFare(baseFare, seatType);
            String seatNumber = String.format("%d%c", rowNum, (char) ('A' + colNum - 1));

            seats.add(Seat.builder()
                    .schedule(schedule)
                    .seatNumber(seatNumber)
                    .rowNumber(rowNum)
                    .columnNumber(colNum)
                    .seatType(seatType)
                    .status(Seat.SeatStatus.AVAILABLE)
                    .fare(Math.round(fare * 100.0) / 100.0)
                    .build());
        }

        seatRepository.saveAll(seats);
    }

    private Seat.SeatType determineSeatType(Bus.BusType busType, int rowNum, int colNum, int seatsPerRow) {
        if (busType == Bus.BusType.SLEEPER || busType == Bus.BusType.AC_SLEEPER) {
            return (rowNum % 2 == 0) ? Seat.SeatType.SLEEPER_UPPER : Seat.SeatType.SLEEPER_LOWER;
        } else if (colNum == 1 || colNum == seatsPerRow) {
            return Seat.SeatType.WINDOW;
        } else {
            return Seat.SeatType.AISLE;
        }
    }

    private double calculateFare(double baseFare, Seat.SeatType seatType) {
        return switch (seatType) {
            case WINDOW -> baseFare * 1.05;
            case SLEEPER_LOWER -> baseFare * 1.10;
            case SLEEPER_UPPER -> baseFare * 0.95;
            default -> baseFare;
        };
    }
}
