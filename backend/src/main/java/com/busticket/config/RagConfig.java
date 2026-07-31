package com.busticket.config;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.chroma.ChromaEmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@Slf4j
public class RagConfig {

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.model.name:llama-3.3-70b-versatile}")
    private String groqModelName;

    @Value("${groq.base-url:https://api.groq.com/openai/v1}")
    private String groqBaseUrl;

    @Value("${chromadb.url:http://localhost:8000}")
    private String chromaUrl;

    @Value("${chromadb.collection-name:bus-policy-embeddings}")
    private String chromaCollectionName;

    @Value("${rag.max-results:4}")
    private int maxResults;

    @Value("${rag.min-score:0.5}")
    private double minScore;

    @Bean
    public EmbeddingModel embeddingModel() {
        log.info("Initializing AllMiniLmL6V2 Local Embedding Model...");
        return new AllMiniLmL6V2EmbeddingModel();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        try {
            log.info("Connecting to ChromaDB Vector Database at: {} [Collection: {}]", chromaUrl, chromaCollectionName);
            ChromaEmbeddingStore chromaStore = ChromaEmbeddingStore.builder()
                    .baseUrl(chromaUrl)
                    .collectionName(chromaCollectionName)
                    .timeout(Duration.ofSeconds(5))
                    .build();
            log.info("Successfully connected to ChromaDB Vector Store");
            return chromaStore;
        } catch (Exception e) {
            log.warn("Could not connect to ChromaDB at {} ({}). Falling back to InMemoryEmbeddingStore for RAG pipeline.",
                    chromaUrl, e.getMessage());
            return new InMemoryEmbeddingStore<>();
        }
    }

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        log.info("Initializing Groq Chat Language Model [{}] via OpenAI-compatible endpoint", groqModelName);
        return OpenAiChatModel.builder()
                .baseUrl(groqBaseUrl)
                .apiKey(groqApiKey)
                .modelName(groqModelName)
                .temperature(0.1)
                .timeout(Duration.ofSeconds(30))
                .logRequests(true)
                .logResponses(true)
                .build();
    }

    @Bean
    public ContentRetriever contentRetriever(EmbeddingStore<TextSegment> embeddingStore, EmbeddingModel embeddingModel) {
        log.info("Configuring EmbeddingStoreContentRetriever (maxResults={}, minScore={})", maxResults, minScore);
        return EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(maxResults)
                .minScore(minScore)
                .build();
    }
}
