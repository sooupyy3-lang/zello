package com.dumbbell.repository;

import com.dumbbell.entity.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    @Query("""
        SELECT s FROM WorkoutSession s
        WHERE s.user.id = :userId
          AND YEAR(s.startedAt)  = :year
          AND MONTH(s.startedAt) = :month
        ORDER BY s.startedAt DESC
        """)
    List<WorkoutSession> findByUserAndMonth(
            @Param("userId") Long userId,
            @Param("year") int year,
            @Param("month") int month);

    List<WorkoutSession> findAllByUserId(Long userId);

    @Query("""
        SELECT s FROM WorkoutSession s
        WHERE s.isActive = true
          AND s.user.id IN (
              SELECT f.friend.id FROM Friendship f
              WHERE f.user.id = :userId AND f.status = 'accepted'
          )
        """)
    List<WorkoutSession> findActiveFriendSessions(@Param("userId") Long userId);

    Optional<WorkoutSession> findByUserIdAndIsActiveTrue(Long userId);
}