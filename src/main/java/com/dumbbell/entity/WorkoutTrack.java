package com.dumbbell.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workout_tracks")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class WorkoutTrack {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private WorkoutSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_type_id", nullable = false)
    private ExerciseType exerciseType;

    @Column(name = "track_order", nullable = false)
    private Integer trackOrder;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TrackStatus status = TrackStatus.idle;

    @Column(name = "elapsed_sec")
    @Builder.Default
    private Integer elapsedSec = 0;

    @Column(name = "calories")
    @Builder.Default
    private Float calories = 0f;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "paused_at")
    private LocalDateTime pausedAt;

    public enum TrackStatus { idle, running, paused, done }

    // 칼로리 계산: MET × 체중 × 0.0175 × 시간(분)
    public void recalcCalories(float weightKg) {
        float minutes = elapsedSec / 60f;
        this.calories = exerciseType.getMetValue() * weightKg * 0.0175f * minutes;
    }
}
