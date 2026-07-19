package com.dumbbell.repository;

import com.dumbbell.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByUserId(Long userId);
    List<GroupMember> findByGroupId(Long groupId);
    List<GroupMember> findByGroupIdIn(List<Long> groupIds);
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
    int countByGroupId(Long groupId);
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);
    int countByUserId(Long userId);
    void deleteByGroupId(Long groupId);

    // 그룹별 오늘 출석(운동 완료)한 멤버 수 — [groupId, 오늘 출석 멤버 수] 로 반환
    // 날짜 경계는 애플리케이션(Asia/Seoul 기준)에서 계산해 전달 — DB의 CURRENT_DATE에 의존하면
    // DB 서버 타임존(대개 UTC) 기준으로 날짜가 바뀌어 버그가 생김
    @Query("""
        SELECT gm.group.id, COUNT(DISTINCT gm.user.id)
        FROM GroupMember gm
        JOIN WorkoutSession s ON s.user.id = gm.user.id
        WHERE gm.group.id IN :groupIds
          AND s.isActive = false AND s.excludedFromRanking = false
          AND s.startedAt >= :start AND s.startedAt < :end
        GROUP BY gm.group.id
        """)
    List<Object[]> findTodayAttendeeCountsByGroup(
            @Param("groupIds") List<Long> groupIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
