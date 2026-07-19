package com.dumbbell.repository;

import com.dumbbell.entity.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dumbbell.dto.RankingResponse;
import java.time.LocalDateTime;
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

    List<WorkoutSession> findByUserIdInAndStartedAtBetween(
            List<Long> userIds, LocalDateTime start, LocalDateTime end);

    @Query("""
        SELECT s FROM WorkoutSession s
        WHERE s.isActive = true
          AND s.user.id IN (
              SELECT f.friend.id FROM Friendship f
              WHERE f.user.id = :userId AND f.status = 'accepted'
          )
        """)
    List<WorkoutSession> findActiveFriendSessions(@Param("userId") Long userId);

    @Query("""
        SELECT s FROM WorkoutSession s
        WHERE s.isActive = true
          AND s.user.id IN (
              SELECT m.user.id FROM GroupMember m WHERE m.group.id = :groupId
          )
        """)
    List<WorkoutSession> findActiveGroupMemberSessions(@Param("groupId") Long groupId);

    Optional<WorkoutSession> findByUserIdAndIsActiveTrue(Long userId);

    // 3시간 이상 켜져 있는 채로 방치된(좀비) 세션 조회 — 자동 종료 스케줄러용
    @Query("""
        SELECT s FROM WorkoutSession s
        WHERE s.isActive = true AND s.startedAt <= :cutoff
        """)
    List<WorkoutSession> findActiveSessionsStartedBefore(@Param("cutoff") LocalDateTime cutoff);

    // 시간순 랭킹 (오늘의 총 운동 시간) — 날짜 경계는 애플리케이션(Asia/Seoul 기준)에서 계산해 전달
    // DB의 CURRENT_DATE에 의존하면 DB 서버 타임존(대개 UTC) 기준으로 날짜가 바뀌어 버그가 생김
    @Query("""
        SELECT new com.dumbbell.dto.RankingResponse(0, s.user.id, s.user.name, SUM(s.totalDurationSec))
        FROM WorkoutSession s
        WHERE s.isActive = false AND s.excludedFromRanking = false
          AND s.startedAt >= :start AND s.startedAt < :end
        GROUP BY s.user.id, s.user.name
        ORDER BY SUM(s.totalDurationSec) DESC
        """)
    List<RankingResponse> findRankingByTotalTime(
            @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // 운동 지속일 랭킹 (총 운동한 날 수)
    @Query("""
        SELECT new com.dumbbell.dto.RankingResponse(0, s.user.id, s.user.name, COUNT(DISTINCT FUNCTION('DATE', s.startedAt)))
        FROM WorkoutSession s
        WHERE s.isActive = false AND s.excludedFromRanking = false
        GROUP BY s.user.id, s.user.name
        ORDER BY COUNT(DISTINCT FUNCTION('DATE', s.startedAt)) DESC
        """)
    List<RankingResponse> findRankingByAttendance();
}