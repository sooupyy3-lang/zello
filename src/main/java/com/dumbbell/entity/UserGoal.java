package com.dumbbell.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_goals")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserGoal {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "weekly_count", nullable = false)
    private Integer weeklyCount;

    @Column(name = "duration_min", nullable = false)
    private Integer durationMin;

    @Column(name = "calorie_target", nullable = false)
    private Integer calorieTarget;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist @PreUpdate
    protected void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
