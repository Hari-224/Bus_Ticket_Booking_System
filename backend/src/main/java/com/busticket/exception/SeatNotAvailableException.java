package com.busticket.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SeatNotAvailableException extends RuntimeException {

    public SeatNotAvailableException(String message) {
        super(message);
    }

    public SeatNotAvailableException(String seatNumber, String reason) {
        super(String.format("Seat %s is not available: %s", seatNumber, reason));
    }
}
