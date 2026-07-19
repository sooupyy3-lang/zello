package com.dumbbell.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Builder
public class AiCoachingResponse {
    private Long          logId;
    private String        aiResponse;
    private String        recommendedRoutine;
    private LocalDateTime createdAt;
}
