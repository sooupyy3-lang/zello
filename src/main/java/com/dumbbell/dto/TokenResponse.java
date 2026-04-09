package com.dumbbell.dto;

import lombok.*;

@Getter @AllArgsConstructor
public class TokenResponse {
    private String token;
    private Long   userId;
    private String name;
}
