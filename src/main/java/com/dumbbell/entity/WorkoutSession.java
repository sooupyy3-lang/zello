package com.dumbbell.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_sessions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WorkoutSession {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "total_duration_sec")
    @Builder.Default
    private Integer totalDurationSec = 0;

    @Column(name = "total_calories")
    @Builder.Default
    private Float totalCalories = 0f;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // 3시간 이상 연속으로 켜져 있던 세션(좀비 세션)은 랭킹 집계에서 제외
    @Column(name = "excluded_from_ranking", nullable = false)
    @Builder.Default
    private Boolean excludedFromRanking = false;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkoutTrack> tracks = new ArrayList<>();
}
