package com.busticket.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSummaryDto {

    private String pnr;
    private String route;
    private String departureTime;
    private String simulatedCancelTime;
    private double bookingAmount;
    private double cancellationCharge;
    private double cancellationFeePercentage;
    private double refundAmount;
    private boolean refundEligibility;
    private String refundProcessingTime;
    private String applicablePolicy;
    private String reason;
}
