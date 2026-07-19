package com.dumbbell.dto;

import lombok.*;
import java.util.List;

@Getter @Builder
public class HomeResponse {
    private String            today;
    private Integer           streakDays;
    private Integer           todayDurationSec;
    private Integer           goalDurationMin;
    private Integer           goalCalorie;
    private List<ActiveFriendDto> activeFriends;
    private List<String>      workedOutDates;
    private String            aiRoutineSummary;

    @Getter @Builder
    public static class ActiveFriendDto {
        private Long    userId;
        private String  name;
        private Integer elapsedSec;
        private Float   calories;
    }
}
