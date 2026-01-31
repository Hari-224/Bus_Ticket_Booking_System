package com.busticket.dto.seat;

import com.busticket.entity.Seat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatLayoutResponse {

    private Long scheduleId;
    private String busNumber;
    private String busName;
    private Integer totalSeats;
    private Integer availableSeats;
    private Integer bookedSeats;
    private Integer lockedSeats;
    private Integer seatsPerRow;
    private List<SeatDto> seats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatDto {
        private Long id;
        private String seatNumber;
        private Integer rowNumber;
        private Integer columnNumber;
        private Seat.SeatType seatType;
        private Seat.SeatStatus status;
        private Double fare;
        private Boolean isLockedByCurrentUser;
    }
}
