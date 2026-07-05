package com.dumbbell.repository;

import com.dumbbell.entity.AiCoachingLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiCoachingLogRepository extends JpaRepository<AiCoachingLog, Long> {
    Optional<AiCoachingLog> findTopByUserIdOrderByCreatedAtDesc(Long userId);
    List<AiCoachingLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}