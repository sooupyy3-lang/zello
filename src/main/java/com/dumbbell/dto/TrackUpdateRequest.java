package com.dumbbell.dto;

import com.dumbbell.entity.WorkoutTrack;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class TrackUpdateRequest {
    @NotNull private WorkoutTrack.TrackStatus status;
    @NotNull private Integer elapsedSec;
}
