package com.dumbbell.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RankingResponse {
    private int rank;
    private Long userId;
    private String userName;
    private Long value;
}
