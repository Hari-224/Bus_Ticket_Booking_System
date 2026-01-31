package com.busticket.repository;

import com.busticket.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.busRoute br " +
            "JOIN FETCH br.bus b " +
            "JOIN FETCH br.route r " +
            "JOIN FETCH br.driver d " +
            "WHERE r.id = :routeId AND s.journeyDate = :journeyDate AND s.status = 'ACTIVE'")
    List<Schedule> findByRouteIdAndJourneyDate(@Param("routeId") Long routeId,
            @Param("journeyDate") LocalDate journeyDate);

    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.busRoute br " +
            "JOIN FETCH br.bus b " +
            "JOIN FETCH br.route r " +
            "JOIN FETCH br.driver d " +
            "WHERE s.journeyDate = :journeyDate AND s.status = 'ACTIVE'")
    List<Schedule> findByJourneyDate(@Param("journeyDate") LocalDate journeyDate);

    @Query("SELECT s FROM Schedule s " +
            "JOIN FETCH s.busRoute br " +
            "JOIN FETCH br.bus b " +
            "JOIN FETCH br.route r " +
            "JOIN FETCH br.driver d " +
            "WHERE s.id = :scheduleId")
    Optional<Schedule> findByIdWithDetails(@Param("scheduleId") Long scheduleId);

    List<Schedule> findByJourneyDateBefore(LocalDate date);

    List<Schedule> findByBusRouteIdAndJourneyDateBetween(Long busRouteId, LocalDate startDate, LocalDate endDate);

    boolean existsByBusRouteIdAndJourneyDate(Long busRouteId, LocalDate journeyDate);

    @Modifying
    @Query("UPDATE Schedule s SET s.status = 'COMPLETED' WHERE s.journeyDate < :today AND s.status = 'ACTIVE'")
    int markPastSchedulesAsCompleted(@Param("today") LocalDate today);

    @Query("SELECT s FROM Schedule s WHERE s.busRoute.id = :busRouteId AND s.journeyDate = :journeyDate")
    Optional<Schedule> findByBusRouteIdAndJourneyDate(@Param("busRouteId") Long busRouteId,
            @Param("journeyDate") LocalDate journeyDate);
}
