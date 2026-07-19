package com.dumbbell.service;

import com.dumbbell.dto.ActiveFriendResponse;
import com.dumbbell.dto.GroupRequest;
import com.dumbbell.dto.GroupResponse;
import com.dumbbell.entity.Group;
import com.dumbbell.entity.GroupMember;
import com.dumbbell.entity.User;
import com.dumbbell.entity.WorkoutSession;
import com.dumbbell.exception.BadRequestException;
import com.dumbbell.exception.ConflictException;
import com.dumbbell.exception.ForbiddenException;
import com.dumbbell.exception.NotFoundException;
import com.dumbbell.repository.GroupMemberRepository;
import com.dumbbell.repository.GroupRepository;
import com.dumbbell.repository.UserRepository;
import com.dumbbell.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepo;
    private final GroupMemberRepository groupMemberRepo;
    private final UserRepository userRepo;
    private final WorkoutSessionRepository sessionRepo;

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

        Map<Long, List<GroupMember>> membersByGroup = fetchMembersByGroup(
                groups.stream().map(Group::getId).collect(Collectors.toList()));

        Comparator<Group> comparator = switch (sort != null ? sort : "recent") {
            case "members" -> Comparator.comparingInt(
                    (Group g) -> membersByGroup.getOrDefault(g.getId(), List.of()).size()).reversed();
            default -> Comparator.comparing(Group::getCreatedAt).reversed();
        };

        return groups.stream()
                .sorted(comparator)
                .map(g -> toDto(g, userId, membersByGroup.getOrDefault(g.getId(), List.of())))
                .collect(Collectors.toList());
    }

    // ── 내 그룹 목록 ──────────────────────────────────────
    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups(Long userId) {
        List<GroupMember> myMemberships = groupMemberRepo.findByUserId(userId);

        Map<Long, List<GroupMember>> membersByGroup = fetchMembersByGroup(
                myMemberships.stream().map(m -> m.getGroup().getId()).collect(Collectors.toList()));

        return myMemberships.stream()
                .map(m -> toDto(m.getGroup(), userId, membersByGroup.getOrDefault(m.getGroup().getId(), List.of())))
                .collect(Collectors.toList());
    }

    private Map<Long, List<GroupMember>> fetchMembersByGroup(List<Long> groupIds) {
        if (groupIds.isEmpty()) return Map.of();
        return groupMemberRepo.findByGroupIdIn(groupIds).stream()
                .collect(Collectors.groupingBy(m -> m.getGroup().getId()));
    }

    // ── 그룹 상세 조회 ────────────────────────────────────
    @Transactional(readOnly = true)
    public GroupResponse getGroup(Long groupId, Long userId) {
        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new NotFoundException("그룹을 찾을 수 없어요"));
        return toDto(group, userId);
    }

    // ── 초대 코드로 가입 ──────────────────────────────────
    @Transactional
    public GroupResponse joinByInviteCode(Long userId, String inviteCode) {
        Group group = groupRepo.findByInviteCode(inviteCode)
                .orElseThrow(() -> new NotFoundException("유효하지 않은 초대 코드예요"));

        if (groupMemberRepo.existsByGroupIdAndUserId(group.getId(), userId))
            throw new ConflictException("이미 가입된 그룹이에요");

        int currentCount = groupMemberRepo.countByGroupId(group.getId());
        if (group.getMaxMembers() != null && currentCount >= group.getMaxMembers())
            throw new ConflictException("정원이 가득 찼어요");

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
                .orElseThrow(() -> new ForbiddenException("그룹 멤버가 아니에요"));

        if (member.getRole() == GroupMember.MemberRole.owner)
            throw new ConflictException("방장은 탈퇴할 수 없어요. 그룹을 삭제하거나 방장을 위임하세요");

        groupMemberRepo.delete(member);
    }

    // ── 그룹 정보 수정 (방장만) ───────────────────────────
    @Transactional
    public GroupResponse updateGroup(Long groupId, Long userId, GroupRequest req) {
        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new NotFoundException("그룹을 찾을 수 없어요"));

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
            throw new BadRequestException("자기 자신을 내보낼 수 없어요");

        GroupMember member = groupMemberRepo.findByGroupIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new NotFoundException("해당 멤버가 없어요"));

        groupMemberRepo.delete(member);
    }

    // ── 그룹 삭제 (방장만) ────────────────────────────────
    @Transactional
    public void deleteGroup(Long groupId, Long userId) {
        Group group = groupRepo.findById(groupId)
                .orElseThrow(() -> new NotFoundException("그룹을 찾을 수 없어요"));

        checkOwner(groupId, userId);

        groupMemberRepo.deleteByGroupId(groupId);
        groupRepo.delete(group);
    }

    // ── 방장 권한 위임 (방장만) ───────────────────────────
    @Transactional
    public GroupResponse delegateOwner(Long groupId, Long userId, Long newOwnerId) {
        checkOwner(groupId, userId);

        if (userId.equals(newOwnerId))
            throw new BadRequestException("본인에게는 위임할 수 없어요");

        GroupMember currentOwner = groupMemberRepo.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new ForbiddenException("그룹 멤버가 아니에요"));
        GroupMember newOwner = groupMemberRepo.findByGroupIdAndUserId(groupId, newOwnerId)
                .orElseThrow(() -> new NotFoundException("위임 대상이 그룹 멤버가 아니에요"));

        currentOwner.setRole(GroupMember.MemberRole.member);
        newOwner.setRole(GroupMember.MemberRole.owner);
        groupMemberRepo.save(currentOwner);
        groupMemberRepo.save(newOwner);

        Group group = groupRepo.findById(groupId).orElseThrow();
        return toDto(group, userId);
    }

    // ── 그룹 멤버 중 현재 운동 중인 사람 목록 ─────────────
    @Transactional(readOnly = true)
    public List<ActiveFriendResponse> getActiveMembers(Long groupId, Long userId) {
        if (!groupMemberRepo.existsByGroupIdAndUserId(groupId, userId))
            throw new ForbiddenException("그룹 멤버가 아니에요");

        return sessionRepo.findActiveGroupMemberSessions(groupId).stream()
                .map(this::toActiveMemberDto)
                .collect(Collectors.toList());
    }

    private ActiveFriendResponse toActiveMemberDto(WorkoutSession s) {
        return ActiveFriendResponse.builder()
                .userId(s.getUser().getId())
                .name(s.getUser().getName())
                .startedAt(s.getStartedAt())
                .exerciseNames(s.getTracks().stream()
                        .map(t -> t.getExerciseType().getName())
                        .distinct()
                        .collect(Collectors.toList()))
                .build();
    }

    // ── 방장 확인 ────────────────────────────────────────
    private void checkOwner(Long groupId, Long userId) {
        GroupMember me = groupMemberRepo.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new ForbiddenException("그룹 멤버가 아니에요"));
        if (me.getRole() != GroupMember.MemberRole.owner)
            throw new ForbiddenException("방장만 가능한 작업이에요");
    }

    // ── DTO 변환 (단일 그룹용 — 멤버 목록을 직접 조회) ────
    private GroupResponse toDto(Group group, Long userId) {
        return toDto(group, userId, groupMemberRepo.findByGroupId(group.getId()));
    }

    // ── DTO 변환 (목록 조회용 — 미리 묶어둔 멤버 목록을 그대로 사용) ──
    private GroupResponse toDto(Group group, Long userId, List<GroupMember> members) {
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
                .inviteCode(group.getInviteCode())
                .myRole(myRole)
                .members(memberInfos)
                .build();
    }
}
