package com.busticket.repository;

import com.busticket.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {

    Optional<Bus> findByBusNumber(String busNumber);

    List<Bus> findByIsActiveTrue();

    List<Bus> findByBusTypeAndIsActiveTrue(Bus.BusType busType);

    boolean existsByBusNumber(String busNumber);
}
