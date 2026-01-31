package com.busticket.dto.route;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteResponse {

    private List<String> sources;
    private List<String> destinations;
    private List<RouteDto> routes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteDto {
        private Long id;
        private String source;
        private String destination;
        private Integer distance;
        private Double durationHours;
        private Double baseFare;
    }
}
