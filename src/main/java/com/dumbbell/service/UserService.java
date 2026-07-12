package com.dumbbell.service;

import com.dumbbell.config.JwtUtil;
import com.dumbbell.dto.*;
import com.dumbbell.entity.*;
import com.dumbbell.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository       userRepo;
    private final UserGoalRepository   goalRepo;
    private final JwtUtil              jwtUtil;

    // ── 닉네임 중복 체크 ──────────────────────────────────
    public boolean isNicknameAvailable(String name) {
        return !userRepo.existsByName(name);
    }

    // ── 회원가입 ──────────────────────────────────────────
    @Transactional
    public TokenResponse register(RegisterRequest req) {
        if (userRepo.existsByName(req.getName())) {
            throw new RuntimeException("이미 사용 중인 닉네임이에요");
        }
        User user = User.builder()
                .name(req.getName())
                .birthDate(req.getBirthDate())
                .gender(req.getGender())
                .heightCm(req.getHeightCm())
                .weightKg(req.getWeightKg())
                .kakaoId(req.getKakaoId())
                .build();
        userRepo.save(user);

        UserGoal goal = UserGoal.builder()
                .user(user)
                .weeklyCount(req.getWeeklyCount())
                .durationMin(req.getDurationMin())
                .calorieTarget(req.getCalorieTarget())
                .build();
        goalRepo.save(goal);

        return new TokenResponse(jwtUtil.generateToken(user.getId()), user.getId(), user.getName());
    }

    // ── 로그인 (MVP 단순화) ───────────────────────────────
    public TokenResponse login(LoginRequest req) {
        User user = userRepo.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요"));
        return new TokenResponse(jwtUtil.generateToken(user.getId()), user.getId(), user.getName());
    }

    // ── 프로필 조회 ───────────────────────────────────────
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요"));
        UserGoal goal = goalRepo.findTopByUserIdOrderByUpdatedAtDesc(userId)
                .orElse(null);

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .birthDate(user.getBirthDate())
                .gender(user.getGender().name())
                .heightCm(user.getHeightCm())
                .weightKg(user.getWeightKg())
                .weeklyCount(goal != null ? goal.getWeeklyCount() : null)
                .durationMin(goal != null ? goal.getDurationMin() : null)
                .calorieTarget(goal != null ? goal.getCalorieTarget() : null)
                .build();
    }

    // ── 프로필/목표 수정 ──────────────────────────────────
    @Transactional
    public void updateProfile(Long userId, RegisterRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요"));
        user.setName(req.getName());
        user.setBirthDate(req.getBirthDate());
        user.setGender(req.getGender());
        user.setHeightCm(req.getHeightCm());
        user.setWeightKg(req.getWeightKg());

        UserGoal goal = goalRepo.findTopByUserIdOrderByUpdatedAtDesc(userId)
                .orElse(UserGoal.builder().user(user).build());
        goal.setWeeklyCount(req.getWeeklyCount());
        goal.setDurationMin(req.getDurationMin());
        goal.setCalorieTarget(req.getCalorieTarget());
        goalRepo.save(goal);
    }
}
