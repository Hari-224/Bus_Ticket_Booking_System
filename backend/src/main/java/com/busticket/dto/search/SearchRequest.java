package com.busticket.dto.search;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {

    @NotBlank(message = "Source city is required")
    private String source;

    @NotBlank(message = "Destination city is required")
    private String destination;

    @NotNull(message = "Journey date is required")
    private LocalDate journeyDate;
}
