package com.dumbbell.controller;

import com.dumbbell.dto.ActiveFriendResponse;
import com.dumbbell.dto.FriendResponse;
import com.dumbbell.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ── FriendController ────────────────────────────────────
@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    // GET /api/friends/active — 현재 운동 중인 친구 목록
    @GetMapping("/active")
    public ResponseEntity<List<ActiveFriendResponse>> getActiveFriends(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(friendService.getActiveFriends(userId));
    }

    // GET /api/friends — 친구 목록
    @GetMapping
    public ResponseEntity<List<FriendResponse>> getFriends(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(friendService.getFriends(userId));
    }

    // GET /api/friends/requests — 받은 친구 요청 목록
    @GetMapping("/requests")
    public ResponseEntity<List<FriendResponse>> getPendingRequests(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(friendService.getPendingRequests(userId));
    }

    // POST /api/friends/by-nickname?nickname= — 닉네임으로 친구 요청
    @PostMapping("/by-nickname")
    public ResponseEntity<FriendResponse> sendRequestByNickname(Authentication auth,
                                                                  @RequestParam String nickname) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(friendService.sendRequestByNickname(userId, nickname));
    }

    // POST /api/friends/{targetId} — 친구 요청 보내기
    @PostMapping("/{targetId}")
    public ResponseEntity<FriendResponse> sendRequest(Authentication auth,
                                                       @PathVariable Long targetId) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(friendService.sendRequest(userId, targetId));
    }

    // PATCH /api/friends/{requesterId}/accept — 친구 요청 수락
    @PatchMapping("/{requesterId}/accept")
    public ResponseEntity<FriendResponse> acceptRequest(Authentication auth,
                                                         @PathVariable Long requesterId) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(friendService.acceptRequest(userId, requesterId));
    }

    // DELETE /api/friends/{targetId} — 친구 삭제 / 요청 거절
    @DeleteMapping("/{targetId}")
    public ResponseEntity<Void> deleteFriend(Authentication auth,
                                              @PathVariable Long targetId) {
        Long userId = (Long) auth.getPrincipal();
        friendService.deleteFriend(userId, targetId);
        return ResponseEntity.ok().build();
    }
}