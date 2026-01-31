package com.busticket.controller;

import com.busticket.dto.common.ApiResponse;
import com.busticket.dto.seat.SeatLayoutResponse;
import com.busticket.dto.seat.SeatLockRequest;
import com.busticket.dto.seat.SeatLockResponse;
import com.busticket.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<SeatLayoutResponse>> getSeatLayout(@PathVariable Long scheduleId) {
        SeatLayoutResponse response = seatService.getSeatLayout(scheduleId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/lock")
    public ResponseEntity<ApiResponse<SeatLockResponse>> lockSeats(@Valid @RequestBody SeatLockRequest request) {
        SeatLockResponse response = seatService.lockSeats(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Seats locked successfully"));
    }

    @PostMapping("/release")
    public ResponseEntity<ApiResponse<Void>> releaseSeats(
            @RequestParam Long scheduleId,
            @RequestBody List<Long> seatIds) {
        seatService.releaseSeats(scheduleId, seatIds);
        return ResponseEntity.ok(ApiResponse.success(null, "Seats released successfully"));
    }
}
