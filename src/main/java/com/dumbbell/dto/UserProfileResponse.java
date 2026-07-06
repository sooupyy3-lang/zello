package com.dumbbell.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Builder
public class UserProfileResponse {
    private Long      id;
    private String    name;
    private LocalDate birthDate;
    private String    gender;
    private Float     heightCm;
    private Float     weightKg;
    private Integer   weeklyCount;
    private Integer   durationMin;
    private Integer   calorieTarget;
    private String    maxDuration;
    private Integer   maxWorkoutDays;
    private Float     maxCalories;
    private String    avgDuration;
    private Float     avgCalories;
    private Integer   groupCount;
    private Integer   friendCount;

    // 이번 주 진행률
    private Integer   weeklyWorkoutCount;     // 이번 주 실제 운동 횟수
    private Integer   weeklyDurationMin;      // 이번 주 실제 운동 시간(분)
    private Float     weeklyCalories;         // 이번 주 실제 소모 칼로리
    private Integer   goalProgressPercent;    // 전체 진행률 (%)
    private Integer   remainDurationMin;      // 목표까지 남은 시간(분)
    private Float     remainCalories;         // 목표까지 남은 칼로리
}
