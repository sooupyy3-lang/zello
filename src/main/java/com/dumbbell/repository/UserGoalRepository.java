package com.dumbbell.repository;

import com.dumbbell.entity.UserGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserGoalRepository extends JpaRepository<UserGoal, Long> {
    Optional<UserGoal> findTopByUserIdOrderByUpdatedAtDesc(Long userId);
}