package com.busticket.controller;

import com.busticket.dto.common.ApiResponse;
import com.busticket.dto.search.SearchResponse;
import com.busticket.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<ApiResponse<SearchResponse>> searchBuses(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        SearchResponse response = searchService.searchBuses(source, destination, date);
        return ResponseEntity.ok(ApiResponse.success(response,
                String.format("Found %d buses from %s to %s on %s",
                        response.getTotalBuses(), source, destination, date)));
    }
}
