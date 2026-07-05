package com.dumbbell.service;

import com.dumbbell.dto.*;
import com.dumbbell.entity.*;
import com.dumbbell.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendshipRepository      friendshipRepo;
    private final UserRepository            userRepo;
    private final WorkoutSessionRepository  sessionRepo;

    // ── 친구 요청 보내기 ──────────────────────────────────
    @Transactional
    public FriendResponse sendRequest(Long userId, Long targetId) {
        if (userId.equals(targetId))
            throw new RuntimeException("자기 자신에게 친구 요청을 보낼 수 없어요");

        friendshipRepo.findByUserIdAndFriendId(userId, targetId)
                .ifPresent(f -> { throw new RuntimeException("이미 친구 요청을 보냈거나 친구 관계예요"); });

        User user   = userRepo.findById(userId).orElseThrow();
        User friend = userRepo.findById(targetId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요"));

        Friendship f = Friendship.builder()
                .user(user)
                .friend(friend)
                .status(Friendship.FriendStatus.pending)
                .build();
        friendshipRepo.save(f);

        return toDto(f);
    }

    // ── 친구 요청 수락 ────────────────────────────────────
    @Transactional
    public FriendResponse acceptRequest(Long userId, Long requesterId) {
        Friendship f = friendshipRepo.findByUserIdAndFriendId(requesterId, userId)
                .orElseThrow(() -> new RuntimeException("친구 요청을 찾을 수 없어요"));

        if (f.getStatus() != Friendship.FriendStatus.pending)
            throw new RuntimeException("이미 처리된 요청이에요");

        f.setStatus(Friendship.FriendStatus.accepted);
        friendshipRepo.save(f);

        // 양방향으로 accepted 저장
        User me     = userRepo.findById(userId).orElseThrow();
        User requester = userRepo.findById(requesterId).orElseThrow();
        Friendship reverse = Friendship.builder()
                .user(me)
                .friend(requester)
                .status(Friendship.FriendStatus.accepted)
                .build();
        friendshipRepo.save(reverse);

        return toDto(f);
    }

    // ── 친구 요청 거절 / 친구 삭제 ───────────────────────
    @Transactional
    public void deleteFriend(Long userId, Long targetId) {
        friendshipRepo.findByUserIdAndFriendId(userId, targetId)
                .ifPresent(friendshipRepo::delete);
        friendshipRepo.findByUserIdAndFriendId(targetId, userId)
                .ifPresent(friendshipRepo::delete);
    }

    // ── 친구 목록 조회 ────────────────────────────────────
    @Transactional(readOnly = true)
    public List<FriendResponse> getFriends(Long userId) {
        return friendshipRepo.findByUserIdAndStatus(userId, Friendship.FriendStatus.accepted)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ── 받은 친구 요청 목록 ───────────────────────────────
    @Transactional(readOnly = true)
    public List<FriendResponse> getPendingRequests(Long userId) {
        return friendshipRepo.findByFriendIdAndStatus(userId, Friendship.FriendStatus.pending)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ── 현재 운동 중인 친구 목록 ──────────────────────────
    @Transactional(readOnly = true)
    public List<ActiveFriendResponse> getActiveFriends(Long userId) {
        return sessionRepo.findActiveFriendSessions(userId).stream()
                .map(s -> ActiveFriendResponse.builder()
                        .userId(s.getUser().getId())
                        .name(s.getUser().getName())
                        .startedAt(s.getStartedAt())
                        .exerciseNames(s.getTracks().stream()
                                .map(t -> t.getExerciseType().getName())
                                .distinct()
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    private FriendResponse toDto(Friendship f) {
        return FriendResponse.builder()
                .friendshipId(f.getId())
                .userId(f.getFriend().getId())
                .name(f.getFriend().getName())
                .status(f.getStatus().name())
                .build();
    }
}
