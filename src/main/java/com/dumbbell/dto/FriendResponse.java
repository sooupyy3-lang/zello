package com.dumbbell.dto;

import lombok.*;

@Getter @Builder
public class FriendResponse {
    private Long   friendshipId;
    private Long   userId;
    private String name;
    private String status;  // pending / accepted / blocked
}
