package com.busticket.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiChatResponse {

    private String question;
    private String answer;
    private boolean contextFound;
    private int retrievedSourcesCount;
    private List<String> sourceSnippets;
    private BookingSummaryDto bookingSummary;
    private LocalDateTime timestamp;
}
