package com.busticket.controller;

import com.busticket.dto.booking.*;
import com.busticket.dto.common.ApiResponse;
import com.busticket.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Booking created. Please complete payment to confirm."));
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(
            @Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = bookingService.processPayment(request);
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }

    @GetMapping("/{pnr}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByPnr(@PathVariable String pnr) {
        BookingResponse response = bookingService.getBookingByPnr(pnr);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/ticket/verify")
    public ResponseEntity<ApiResponse<BookingResponse>> verifyAndGetTicket(
            @Valid @RequestBody TicketVerificationRequest request) {
        BookingResponse response = bookingService.verifyAndGetBooking(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my-trips")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyTrips() {
        List<BookingResponse> response = bookingService.getMyTrips();
        return ResponseEntity.ok(ApiResponse.success(response,
                String.format("Found %d bookings", response.size())));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<CancelBookingResponse>> cancelBooking(
            @Valid @RequestBody CancelBookingRequest request) {
        CancelBookingResponse response = bookingService.cancelBooking(request);
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }
}
