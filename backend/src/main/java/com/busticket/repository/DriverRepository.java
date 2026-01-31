package com.busticket.repository;

import com.busticket.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByLicenseNumber(String licenseNumber);

    List<Driver> findByIsActiveTrue();

    boolean existsByLicenseNumber(String licenseNumber);
}
