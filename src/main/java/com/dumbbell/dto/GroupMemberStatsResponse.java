package com.dumbbell.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Builder
public class GroupMemberStatsResponse {
    private Long userId;
    private String name;
    private String role;              // owner | member
    private Integer rank;             // 그룹 내 오늘의 운동 랭킹 (오늘 세션이 없으면 null)
    private Long todayDurationSec;    // 오늘의 운동 시간 (초)
    private Float todayCalories;      // 오늘의 총 소모 칼로리
    private LocalDateTime startedAt;  // 오늘 첫 세션 시작 시간
    private LocalDateTime endedAt;    // 오늘 마지막 세션 종료 시간 (진행 중이면 null)
    private Integer maxDurationSec;   // 역대 최대 지속 시간 (초)
}
