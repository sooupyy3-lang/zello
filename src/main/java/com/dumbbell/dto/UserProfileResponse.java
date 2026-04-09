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
}
