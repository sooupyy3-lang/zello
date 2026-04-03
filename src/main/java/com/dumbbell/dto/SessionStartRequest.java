package com.dumbbell.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SessionStartRequest {
    @NotEmpty
    private List<Long> exerciseTypeIds;
}
