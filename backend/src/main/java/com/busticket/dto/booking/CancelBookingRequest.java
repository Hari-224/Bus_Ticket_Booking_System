package com.busticket.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelBookingRequest {

    @NotBlank(message = "PNR is required")
    private String pnr;

    // If null or empty, full cancellation. Otherwise, partial cancellation
    private List<Long> passengerIdsToCancel;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
}
