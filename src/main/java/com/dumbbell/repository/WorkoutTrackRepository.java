package com.dumbbell.repository;

import com.dumbbell.entity.WorkoutTrack;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutTrackRepository extends JpaRepository<WorkoutTrack, Long> {
}
