package com.dumbbell.dto;

import lombok.*;

@Getter @Builder
public class AiCoachingResponse {
    private Long   logId;
    private String aiResponse;
    private String recommendedRoutine;
}
