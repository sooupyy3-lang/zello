package com.dumbbell.repository;

import com.dumbbell.entity.ExerciseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ExerciseTypeRepository extends JpaRepository<ExerciseType, Long> {
    List<ExerciseType> findByCategory(String category);

    @Query("SELECT DISTINCT e.category FROM ExerciseType e ORDER BY e.category")
    List<String> findAllCategories();
}