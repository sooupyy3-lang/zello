package com.dumbbell.repository;

import com.dumbbell.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
    @Query("""
        SELECT gm.group.id, COUNT(DISTINCT gm.user.id)
        FROM GroupMember gm
        JOIN WorkoutSession s ON s.user.id = gm.user.id
        WHERE gm.group.id IN :groupIds
          AND s.isActive = false AND s.excludedFromRanking = false
          AND FUNCTION('DATE', s.startedAt) = CURRENT_DATE
        GROUP BY gm.group.id
        """)
    List<Object[]> findTodayAttendeeCountsByGroup(@Param("groupIds") List<Long> groupIds);
}
