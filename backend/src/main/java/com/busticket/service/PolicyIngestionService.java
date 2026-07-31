package com.busticket.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class PolicyIngestionService {

    private final EmbeddingStore<TextSegment> embeddingStore;
    private final EmbeddingModel embeddingModel;

    private static final String POLICY_DIR = "src/main/resources/policies";

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            log.info("Starting automatic PDF Policy Document Ingestion into Vector Store...");
            ingestAllPolicies();
        } catch (Exception e) {
            log.error("Failed to ingest policy documents into Vector Store: {}", e.getMessage(), e);
        }
    }

    public synchronized int ingestAllPolicies() {
        Path policyPath = Paths.get(POLICY_DIR);
        if (!Files.exists(policyPath)) {
            log.warn("Policy directory does not exist: {}", policyPath.toAbsolutePath());
            return 0;
        }

        List<File> pdfFiles = new ArrayList<>();
        try (Stream<Path> paths = Files.walk(policyPath)) {
            paths.filter(Files::isRegularFile)
                    .filter(p -> p.toString().toLowerCase().endsWith(".pdf"))
                    .forEach(p -> pdfFiles.add(p.toFile()));
        } catch (Exception e) {
            log.error("Error reading policy directory: {}", e.getMessage());
        }

        if (pdfFiles.isEmpty()) {
            log.warn("No policy PDF documents found in {}", policyPath.toAbsolutePath());
            return 0;
        }

        ApachePdfBoxDocumentParser pdfParser = new ApachePdfBoxDocumentParser();
        EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                .documentSplitter(DocumentSplitters.recursive(300, 30))
                .embeddingModel(embeddingModel)
                .embeddingStore(embeddingStore)
                .build();

        int ingestedCount = 0;
        for (File pdfFile : pdfFiles) {
            try {
                log.info("Parsing and indexing policy PDF: {}", pdfFile.getName());
                Document document = FileSystemDocumentLoader.loadDocument(pdfFile.toPath(), pdfParser);
                ingestor.ingest(document);
                ingestedCount++;
                log.info("Successfully ingested policy PDF: {}", pdfFile.getName());
            } catch (Exception e) {
                log.error("Error ingesting file {}: {}", pdfFile.getName(), e.getMessage());
            }
        }

        log.info("Completed Policy Document Ingestion. Indexed {} PDF documents into Vector Store.", ingestedCount);
        return ingestedCount;
    }
}
