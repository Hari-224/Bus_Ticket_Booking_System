package com.busticket.service;

import com.busticket.dto.ai.AiChatRequest;
import com.busticket.dto.ai.AiChatResponse;
import com.busticket.dto.ai.BookingSummaryDto;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.rag.content.Content;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.query.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagService {

    private final ContentRetriever contentRetriever;
    private final ChatLanguageModel chatLanguageModel;
    private final BookingCalculatorService bookingCalculatorService;

    private static final String SYSTEM_PROMPT = """
            You are BusEase AI Travel & Booking Assistant.
            Your task is to generate a direct, warm, concise, and user-friendly natural language response answering the user's question.
            
            STRICT RULES:
            1. DO NOT mention internal implementation terms (such as "simulated cancellation time", "backend calculation", "vector store", "policy chunks", "LLM", or "PNR" unless asked).
            2. DO NOT include step-by-step arithmetic equations or manual math formulas (e.g. "Refund = 0.5 * 2862.15").
            3. Use ONLY the final pre-calculated values provided in the context below (Net Refund Amount, Cancellation Charge, Policy Window, Processing Time).
            4. Explicitly explain policy windows if relevant (e.g. state clearly that cancellations at 3 hours or 5 hours fall under the same 2–12 hour policy window for a 50% refund).
            5. Keep your response natural, helpful, and under 3 to 4 sentences.
            """;

    public AiChatResponse processQuestion(AiChatRequest request) {
        String userQuestion = request.getQuestion().trim();
        log.info("Processing AI Assistant question: '{}'", userQuestion);

        // Step 1: Check if this is a personalized booking/refund query
        boolean isPersonalized = bookingCalculatorService.isPersonalizedQuery(userQuestion);
        BookingSummaryDto bookingSummary = null;

        if (isPersonalized) {
            bookingSummary = bookingCalculatorService.calculatePersonalizedRefund(userQuestion);
            if (bookingSummary == null) {
                return AiChatResponse.builder()
                        .question(userQuestion)
                        .answer("To calculate your exact refund amount and cancellation fee, I need your booking details.\n\nPlease provide your **PNR number** (e.g., *PNR BT16825382*) or log in to your BusEase account!")
                        .contextFound(false)
                        .retrievedSourcesCount(0)
                        .sourceSnippets(List.of())
                        .timestamp(LocalDateTime.now())
                        .build();
            }
        }

        // Step 2: Semantic Policy Context Retrieval from Vector Store
        List<Content> retrievedContents = new ArrayList<>();
        try {
            retrievedContents = contentRetriever.retrieve(Query.from(userQuestion));
        } catch (Exception e) {
            log.error("Error retrieving context from Vector Store: {}", e.getMessage(), e);
        }

        List<String> snippets = retrievedContents.stream()
                .map(c -> c.textSegment().text())
                .collect(Collectors.toList());

        boolean contextFound = !snippets.isEmpty();
        log.info("Retrieved {} relevant context chunks for question: '{}'", snippets.size(), userQuestion);

        if (!contextFound && bookingSummary == null) {
            return AiChatResponse.builder()
                    .question(userQuestion)
                    .answer("I'm sorry, but I couldn't find any relevant policy documents addressing your question. Please feel free to rephrase your question or contact BusEase Customer Support for assistance.")
                    .contextFound(false)
                    .retrievedSourcesCount(0)
                    .sourceSnippets(List.of())
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        // Step 3: Build Prompt for Groq LLM
        String userPrompt;
        if (bookingSummary != null) {
            userPrompt = String.format("""
                    BOOKING & REFUND DETAILS:
                    - Route: %s
                    - Scheduled Departure: %s
                    - Target Cancellation Time: %s
                    - Total Ticket Price Paid: ₹%.2f
                    - Cancellation Fee: ₹%.2f (%d%%)
                    - Estimated Net Refund Amount: ₹%.2f
                    - Status: %s
                    - Policy Assessment: %s
                    - Processing Time: %s
                    
                    USER QUESTION:
                    %s
                    
                    Generate a direct, natural 2-3 sentence response answering the user's question using the exact values above.
                    """,
                    bookingSummary.getRoute(),
                    bookingSummary.getDepartureTime(),
                    bookingSummary.getSimulatedCancelTime(),
                    bookingSummary.getBookingAmount(),
                    bookingSummary.getCancellationCharge(),
                    (int) bookingSummary.getCancellationFeePercentage(),
                    bookingSummary.getRefundAmount(),
                    bookingSummary.isRefundEligibility() ? "Eligible for Refund" : "Non-Refundable",
                    bookingSummary.getReason(),
                    bookingSummary.getRefundProcessingTime(),
                    userQuestion);
        } else {
            StringBuilder contextBuilder = new StringBuilder();
            for (int i = 0; i < snippets.size(); i++) {
                contextBuilder.append("--- Policy Document Context ").append(i + 1).append(" ---\n");
                contextBuilder.append(snippets.get(i)).append("\n\n");
            }

            userPrompt = String.format("""
                    POLICY CONTEXT:
                    %s
                    
                    USER QUESTION:
                    %s
                    
                    Answer the user's question concisely using strictly the policy context above.
                    """, contextBuilder.toString(), userQuestion);
        }

        // Step 4: LLM Invocation
        String answer;
        try {
            Response<AiMessage> llmResponse = chatLanguageModel.generate(
                    SystemMessage.from(SYSTEM_PROMPT),
                    UserMessage.from(userPrompt)
            );
            answer = llmResponse.content().text();
        } catch (Exception e) {
            log.error("Failed to generate LLM response from Groq: {}", e.getMessage(), e);
            if (bookingSummary != null) {
                answer = String.format("For booking **%s** (%s):\nIf cancelled at **%s**, your cancellation charge is ₹%.2f (%d%%) and your net refund amount is **₹%.2f** (%s). Refund processing takes 3 to 5 business days.",
                        bookingSummary.getPnr(), bookingSummary.getRoute(), bookingSummary.getSimulatedCancelTime(),
                        bookingSummary.getCancellationCharge(), (int) bookingSummary.getCancellationFeePercentage(),
                        bookingSummary.getRefundAmount(), bookingSummary.isRefundEligibility() ? "Eligible" : "Non-Refundable");
            } else {
                answer = "I'm currently unable to connect to the AI model service. Please try again shortly.";
            }
        }

        return AiChatResponse.builder()
                .question(userQuestion)
                .answer(answer)
                .contextFound(contextFound || bookingSummary != null)
                .retrievedSourcesCount(snippets.size())
                .sourceSnippets(snippets)
                .bookingSummary(bookingSummary)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
