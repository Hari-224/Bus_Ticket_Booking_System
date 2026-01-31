package com.busticket.repository;

import com.busticket.entity.BusRoute;
import com.busticket.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusRouteRepository extends JpaRepository<BusRoute, Long> {

    List<BusRoute> findByRouteAndIsActiveTrue(Route route);

    @Query("SELECT br FROM BusRoute br " +
            "JOIN FETCH br.bus b " +
            "JOIN FETCH br.route r " +
            "JOIN FETCH br.driver d " +
            "WHERE r.id = :routeId AND br.isActive = true AND b.isActive = true")
    List<BusRoute> findByRouteIdWithDetails(@Param("routeId") Long routeId);

    @Query("SELECT br FROM BusRoute br WHERE br.isActive = true")
    List<BusRoute> findAllActive();

    boolean existsByBusIdAndRouteId(Long busId, Long routeId);
}
