package com.dumbbell.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Builder
public class SessionResponse {
    private Long           sessionId;
    private Boolean        isActive;
    private Integer        totalDurationSec;
    private Float          totalCalories;
    private LocalDateTime  startedAt;
    private List<TrackDto> tracks;

    @Getter @Builder
    public static class TrackDto {
        private Long    trackId;
        private Long    exerciseTypeId;
        private String  exerciseName;
        private String  category;
        private Integer trackOrder;
        private String  status;
        private Integer elapsedSec;
        private Float   calories;
    }
}
