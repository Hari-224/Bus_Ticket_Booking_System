package com.busticket.repository;

import com.busticket.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {

    @Query("SELECT DISTINCT r.source FROM Route r WHERE r.isActive = true ORDER BY r.source")
    List<String> findAllSources();

    @Query("SELECT DISTINCT r.destination FROM Route r WHERE r.isActive = true ORDER BY r.destination")
    List<String> findAllDestinations();

    @Query("SELECT DISTINCT r.destination FROM Route r WHERE r.source = :source AND r.isActive = true ORDER BY r.destination")
    List<String> findDestinationsBySource(@Param("source") String source);

    Optional<Route> findBySourceAndDestinationAndIsActiveTrue(String source, String destination);

    List<Route> findByIsActiveTrue();

    @Query("SELECT r FROM Route r WHERE LOWER(r.source) = LOWER(:source) AND LOWER(r.destination) = LOWER(:destination) AND r.isActive = true")
    Optional<Route> findBySourceAndDestinationIgnoreCase(@Param("source") String source,
            @Param("destination") String destination);

    boolean existsBySourceAndDestination(String source, String destination);
}
