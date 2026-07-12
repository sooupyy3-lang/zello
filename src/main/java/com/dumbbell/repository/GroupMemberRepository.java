package com.dumbbell.repository;

import com.dumbbell.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    List<GroupMember> findByUserId(Long userId);
    List<GroupMember> findByGroupId(Long groupId);
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
    int countByGroupId(Long groupId);
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);
    int countByUserId(Long userId);
}
