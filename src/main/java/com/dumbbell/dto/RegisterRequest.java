package com.dumbbell.dto;

import com.dumbbell.entity.User;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {
    @NotBlank  private String name;
    @NotNull   private LocalDate birthDate;
    @NotNull   private User.Gender gender;
    @NotNull @Positive private Float heightCm;
    @NotNull @Positive private Float weightKg;
    @NotNull @Min(1) private Integer weeklyCount;
    @NotNull @Min(1) private Integer durationMin;
    @NotNull @Min(1) private Integer calorieTarget;
}
