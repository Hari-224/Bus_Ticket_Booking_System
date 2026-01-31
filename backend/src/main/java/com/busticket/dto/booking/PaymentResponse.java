package com.busticket.dto.booking;

import com.busticket.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private String transactionId;
    private String pnr;
    private Double amount;
    private Payment.PaymentStatus status;
    private LocalDateTime paymentTime;
    private String message;
    private BookingResponse booking;
}
