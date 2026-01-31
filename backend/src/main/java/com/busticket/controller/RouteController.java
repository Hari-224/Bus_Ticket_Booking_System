package com.busticket.controller;

import com.busticket.dto.common.ApiResponse;
import com.busticket.dto.route.RouteResponse;
import com.busticket.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @GetMapping
    public ResponseEntity<ApiResponse<RouteResponse>> getAllRoutes() {
        RouteResponse response = routeService.getAllRoutes();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/destinations")
    public ResponseEntity<ApiResponse<List<String>>> getDestinationsBySource(@RequestParam String source) {
        List<String> destinations = routeService.getDestinationsBySource(source);
        return ResponseEntity.ok(ApiResponse.success(destinations));
    }
}
