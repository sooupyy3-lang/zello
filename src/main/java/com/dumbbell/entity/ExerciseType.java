package com.dumbbell.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exercise_types")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ExerciseType {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;       // 걷기, 달리기, 상체, 하체 ...

    @Column(nullable = false, length = 50)
    private String category;   // 러닝, 헬스, 홈트 ...

    @Column(name = "met_value", nullable = false)
    private Float metValue;
}
