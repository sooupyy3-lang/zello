package com.dumbbell.repository;

import com.dumbbell.entity.ExerciseType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExerciseTypeRepository extends JpaRepository<ExerciseType, Long> {
    List<ExerciseType> findByCategory(String category);
}