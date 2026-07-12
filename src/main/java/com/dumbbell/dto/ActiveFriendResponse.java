package com.dumbbell.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Builder
public class ActiveFriendResponse {
    private Long userId;
    private String name;
    private LocalDateTime startedAt;
    private List<String> exerciseNames;
}
