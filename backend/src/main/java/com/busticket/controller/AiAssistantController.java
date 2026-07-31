package com.busticket.controller;

import com.busticket.dto.ai.AiChatRequest;
import com.busticket.dto.ai.AiChatResponse;
import com.busticket.service.PolicyIngestionService;
import com.busticket.service.RagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiAssistantController {

    private final RagService ragService;
    private final PolicyIngestionService policyIngestionService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> askQuestion(@Valid @RequestBody AiChatRequest request) {
        log.info("Received AI Chat Question: {}", request.getQuestion());
        AiChatResponse response = ragService.processQuestion(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> reindexPolicies() {
        log.info("Manual re-indexing requested for policy PDF documents...");
        int count = policyIngestionService.ingestAllPolicies();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Successfully re-indexed policy documents into Vector Store",
                "indexedDocumentsCount", count
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "BusEase RAG AI Travel Assistant",
                "vectorStore", "Active"
        ));
    }
}
