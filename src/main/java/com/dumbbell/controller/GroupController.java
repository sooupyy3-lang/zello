package com.dumbbell.controller;

import com.dumbbell.dto.ActiveFriendResponse;
import com.dumbbell.dto.DelegateOwnerRequest;
import com.dumbbell.dto.GroupRequest;
import com.dumbbell.dto.GroupResponse;
import com.dumbbell.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    // POST /api/groups — 그룹 생성
    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(Authentication auth,
                                                      @Valid @RequestBody GroupRequest req) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(groupService.createGroup(userId, req));
    }

    // GET /api/groups?keyword=&sort=recent|members — 그룹 탐색
    @GetMapping
    public ResponseEntity<List<GroupResponse>> exploreGroups(Authentication auth,
                                                              @RequestParam(required = false) String keyword,
                                                              @RequestParam(required = false) String sort) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(groupService.exploreGroups(userId, keyword, sort));
    }

    // GET /api/groups/my — 내 그룹 목록
    @GetMapping("/my")
    public ResponseEntity<List<GroupResponse>> getMyGroups(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(groupService.getMyGroups(userId));
    }

    // GET /api/groups/{groupId} — 그룹 상세
    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponse> getGroup(Authentication auth,
                                                   @PathVariable Long groupId) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(groupService.getGroup(groupId, userId));
    }

    // POST /api/groups/join — 초대 코드로 가입
    @PostMapping("/join")
    public ResponseEntity<GroupResponse> joinByInviteCode(Authentication auth,
                                                           @RequestParam String inviteCode) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(groupService.joinByInviteCode(userId, inviteCode));
    }

    // POST /api/groups/{groupId}/join — 그룹 탐색(검색)에서 바로 가입 (초대코드 불필요)
    @PostMapping("/{groupId}/join")
    public ResponseEntity<GroupResponse> joinByGroupId(Authentication auth,
                                                        @PathVariable Long groupId) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(groupService.joinByGroupId(userId, groupId));
    }

    // DELETE /api/groups/{groupId}/leave — 그룹 탈퇴
    @DeleteMapping("/{groupId}/leave")
    public ResponseEntity<Void> leaveGroup(Authentication auth,
                                           @PathVariable Long groupId) {
        Long userId = (Long) auth.getPrincipal();
        groupService.leaveGroup(groupId, userId);
        return ResponseEntity.ok().build();
    }

    // PUT /api/groups/{groupId} — 그룹 정보 수정 (방장만)
    @PutMapping("/{groupId}")
    public ResponseEntity<GroupResponse> updateGroup(Authentication auth,
                                                      @PathVariable Long groupId,
                                                      @Valid @RequestBody GroupRequest req) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(groupService.updateGroup(groupId, userId, req));
    }

    // DELETE /api/groups/{groupId}/members/{targetUserId} — 그룹원 내보내기 (방장만)
    @DeleteMapping("/{groupId}/members/{targetUserId}")
    public ResponseEntity<Void> kickMember(Authentication auth,
                                           @PathVariable Long groupId,
                                           @PathVariable Long targetUserId) {
        Long userId = (Long) auth.getPrincipal();
        groupService.kickMember(groupId, userId, targetUserId);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/groups/{groupId} — 그룹 삭제 (방장만)
    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(Authentication auth,
                                            @PathVariable Long groupId) {
        Long userId = (Long) auth.getPrincipal();
        groupService.deleteGroup(groupId, userId);
        return ResponseEntity.ok().build();
    }

    // PATCH /api/groups/{groupId}/owner — 방장 권한 위임 (방장만)
    @PatchMapping("/{groupId}/owner")
    public ResponseEntity<GroupResponse> delegateOwner(Authentication auth,
                                                        @PathVariable Long groupId,
                                                        @RequestBody DelegateOwnerRequest req) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(groupService.delegateOwner(groupId, userId, req.getNewOwnerId()));
    }

    // GET /api/groups/{groupId}/active — 그룹 멤버 중 현재 운동 중인 사람 목록
    @GetMapping("/{groupId}/active")
    public ResponseEntity<List<ActiveFriendResponse>> getActiveMembers(Authentication auth,
                                                                        @PathVariable Long groupId) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(groupService.getActiveMembers(groupId, userId));
    }
}
