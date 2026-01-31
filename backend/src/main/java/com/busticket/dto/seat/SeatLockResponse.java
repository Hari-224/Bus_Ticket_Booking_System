package com.busticket.dto.seat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatLockResponse {

    private Long scheduleId;
    private List<String> lockedSeats;
    private Double totalFare;
    private LocalDateTime lockExpiryTime;
    private Long lockDurationSeconds;
    private String message;
}
