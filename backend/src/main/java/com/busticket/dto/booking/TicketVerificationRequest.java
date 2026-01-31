package com.busticket.dto.booking;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketVerificationRequest {
    @NotBlank(message = "PNR is required")
    private String pnr;

    private String email;
    private String mobile;
}
