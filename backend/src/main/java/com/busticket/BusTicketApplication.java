package com.busticket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for the Bus Ticket Booking System.
 * Enables scheduling for seat lock cleanup and schedule rotation.
 */
@SpringBootApplication
@EnableScheduling
public class BusTicketApplication {

    public static void main(String[] args) {
        SpringApplication.run(BusTicketApplication.class, args);
    }
}
