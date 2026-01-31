package com.busticket.service;

import com.busticket.dto.route.RouteResponse;
import com.busticket.entity.Route;
import com.busticket.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RouteService {

    private final RouteRepository routeRepository;

    @Transactional(readOnly = true)
    public RouteResponse getAllRoutes() {
        List<Route> routes = routeRepository.findByIsActiveTrue();

        return RouteResponse.builder()
                .sources(routeRepository.findAllSources())
                .destinations(routeRepository.findAllDestinations())
                .routes(routes.stream()
                        .map(this::mapToRouteDto)
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<String> getDestinationsBySource(String source) {
        return routeRepository.findDestinationsBySource(source);
    }

    private RouteResponse.RouteDto mapToRouteDto(Route route) {
        return RouteResponse.RouteDto.builder()
                .id(route.getId())
                .source(route.getSource())
                .destination(route.getDestination())
                .distance(route.getDistance())
                .durationHours(route.getDurationHours())
                .baseFare(route.getBaseFare())
                .build();
    }
}
