package com.busticket.dto.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelBookingResponse {

    private String pnr;
    private String status;
    private Integer cancelledPassengers;
    private Double refundAmount;
    private String message;
}
