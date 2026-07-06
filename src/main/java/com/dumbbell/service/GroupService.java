package com.dumbbell.service;

import com.dumbbell.dto.GroupRequest;
import com.dumbbell.dto.GroupResponse;
import com.dumbbell.entity.Group;
import com.dumbbell.entity.GroupMember;
import com.dumbbell.entity.User;
import com.dumbbell.repository.GroupMemberRepository;
import com.dumbbell.repository.GroupRepository;
import com.dumbbell.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepo;
    private final GroupMemberRepository groupMemberRepo;
    private final UserRepository userRepo;

    // ── 그룹 생성 ─────────────────────────────────────────
    @Transactional
    public GroupResponse createGroup(Long userId, GroupRequest req) {
        User user = userRepo.findById(userId).orElseThrow();

        Group group = Group.builder()
                .name(req.getName())
                .description(req.getDescription())
                .category(req.getCategory())
                .goal(req.getGoal())
                .maxMembers(req.getMaxMembers())
                .createdBy(user)
                .build();
        groupRepo.save(group);

        GroupMember owner = GroupMember.builder()
                .group(group)
                .user(user)
                .role(GroupMember.MemberRole.owner)
                .build();
        groupMemberRepo.save(owner);

        return toDto(group, userId);
    }

    // ── 그룹 탐색 (전체 목록 + 검색 + 정렬) ──────────────
    @Transactional(readOnly = true)
    public List<GroupResponse> exploreGroups(Long userId, String keyword, String sort) {
        List<Group> groups = (keyword != null && !keyword.isBlank())
                ? groupRepo.searchByKeyword(keyword)
                : groupRepo.findAll();

        Comparator<Group> comparator = switch (sort != null ? sort : "recent") {
            case "members" -> Comparator.comparingInt(
                    (Group g) -> groupMemberRepo.countByGroupId(g.getId())).reversed();
            default -> Comparator.comparing(Group::getCreatedAt).reversed();
        };

        return groups.stream()
                .sorted(comparator)
                .map(g -> toDto(g, userId))
                .collect(Collectors.toList());
    }

    // ── 내 그룹 목록 ──────────────────────────────────────
    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups(Long userId) {
        return groupMemberRepo.findByUserId(userId).stream()
                .map(m -> toDto(m.getGroup(), userId))
                .collect(Collectors.toList());
    }

    // ── 그룹 상세 조회 ────────────────────────────────────
    @Transactional(readOnly = true)
    public GroupResponse getGroup(Long groupId, Long userId) {
        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("그룹을 찾을 수 없어요"));
        return toDto(group, userId);
    }

    // ── 초대 코드로 가입 ──────────────────────────────────
    @Transactional
    public GroupResponse joinByInviteCode(Long userId, String inviteCode) {
        Group group = groupRepo.findByInviteCode(inviteCode)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 초대 코드예요"));

        if (groupMemberRepo.existsByGroupIdAndUserId(group.getId(), userId))
            throw new RuntimeException("이미 가입된 그룹이에요");

        int currentCount = groupMemberRepo.countByGroupId(group.getId());
        if (group.getMaxMembers() != null && currentCount >= group.getMaxMembers())
            throw new RuntimeException("정원이 가득 찼어요");

        User user = userRepo.findById(userId).orElseThrow();
        GroupMember member = GroupMember.builder()
                .group(group)
                .user(user)
                .role(GroupMember.MemberRole.member)
                .build();
        groupMemberRepo.save(member);

        return toDto(group, userId);
    }

    // ── 그룹 탈퇴 ────────────────────────────────────────
    @Transactional
    public void leaveGroup(Long groupId, Long userId) {
        GroupMember member = groupMemberRepo.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("그룹 멤버가 아니에요"));

        if (member.getRole() == GroupMember.MemberRole.owner)
            throw new RuntimeException("방장은 탈퇴할 수 없어요. 그룹을 삭제하거나 방장을 위임하세요");

        groupMemberRepo.delete(member);
    }

    // ── 그룹 정보 수정 (방장만) ───────────────────────────
    @Transactional
    public GroupResponse updateGroup(Long groupId, Long userId, GroupRequest req) {
        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("그룹을 찾을 수 없어요"));

        checkOwner(groupId, userId);

        group.setName(req.getName());
        group.setDescription(req.getDescription());
        group.setCategory(req.getCategory());
        group.setGoal(req.getGoal());
        group.setMaxMembers(req.getMaxMembers());
        groupRepo.save(group);

        return toDto(group, userId);
    }

    // ── 그룹원 내보내기 (방장만) ──────────────────────────
    @Transactional
    public void kickMember(Long groupId, Long ownerId, Long targetUserId) {
        checkOwner(groupId, ownerId);

        if (ownerId.equals(targetUserId))
            throw new RuntimeException("자기 자신을 내보낼 수 없어요");

        GroupMember member = groupMemberRepo.findByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new RuntimeException("해당 멤버가 없어요"));

        groupMemberRepo.delete(member);
    }

    // ── 방장 확인 ────────────────────────────────────────
    private void checkOwner(Long groupId, Long userId) {
        GroupMember me = groupMemberRepo.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("그룹 멤버가 아니에요"));
        if (me.getRole() != GroupMember.MemberRole.owner)
            throw new RuntimeException("방장만 가능한 작업이에요");
    }

    // ── DTO 변환 ─────────────────────────────────────────
    private GroupResponse toDto(Group group, Long userId) {
        List<GroupMember> members = groupMemberRepo.findByGroupId(group.getId());

        String myRole = members.stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .map(m -> m.getRole().name())
                .findFirst().orElse(null);

        List<GroupResponse.MemberInfo> memberInfos = members.stream()
                .map(m -> GroupResponse.MemberInfo.builder()
                        .userId(m.getUser().getId())
                        .name(m.getUser().getName())
                        .role(m.getRole().name())
                        .build())
                .collect(Collectors.toList());

        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .category(group.getCategory())
                .goal(group.getGoal())
                .maxMembers(group.getMaxMembers())
                .memberCount(members.size())
                .inviteCode(myRole != null ? group.getInviteCode() : null) // 멤버만 초대코드 노출
                .myRole(myRole)
                .members(memberInfos)
                .build();
    }
}
