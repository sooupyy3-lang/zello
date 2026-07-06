package com.dumbbell.service;

import com.dumbbell.dto.UserProfileResponse;
import com.dumbbell.entity.*;
import com.dumbbell.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final WorkoutSessionRepository sessionRepo;
    private final FriendshipRepository     friendshipRepo;
    private final GroupMemberRepository    groupMemberRepo;
    private final UserRepository           userRepo;
    private final UserGoalRepository       goalRepo;

    // ── 마이페이지 전체 (프로필 + 통계) ──────────────────
    @Transactional(readOnly = true)
    public UserProfileResponse getFullProfile(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요"));
        UserGoal goal = goalRepo.findTopByUserIdOrderByUpdatedAtDesc(userId).orElse(null);

        // 전체 세션 목록
        List<WorkoutSession> allSessions = sessionRepo.findAllByUserId(userId);

        // 최대 운동 지속 시간 (초 → HH:mm:ss)
        int maxSec = allSessions.stream()
                .mapToInt(s -> s.getTotalDurationSec() != null ? s.getTotalDurationSec() : 0)
                .max().orElse(0);

        // 최대 연속 운동 일수
        int maxStreak = calcMaxStreak(allSessions);

        // 최대 소모 칼로리 (1회)
        float maxCalories = (float) allSessions.stream()
                .mapToDouble(s -> s.getTotalCalories() != null ? s.getTotalCalories() : 0)
                .max().orElse(0);

        // 평균 운동 시간 (초)
        double avgSec = allSessions.stream()
                .mapToInt(s -> s.getTotalDurationSec() != null ? s.getTotalDurationSec() : 0)
                .average().orElse(0);

        // 평균 소모 칼로리
        double avgCalories = allSessions.stream()
                .mapToDouble(s -> s.getTotalCalories() != null ? s.getTotalCalories() : 0)
                .average().orElse(0);

        // 친구 수
        int friendCount = friendshipRepo
                .findByUserIdAndStatus(userId, Friendship.FriendStatus.accepted).size();

        // 그룹 수
        int groupCount = groupMemberRepo.countByUserId(userId);

        // 이번 주 세션 (월요일 ~ 오늘)
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(java.time.DayOfWeek.MONDAY);
        List<WorkoutSession> weeklySessions = allSessions.stream()
                .filter(s -> {
                    LocalDate d = s.getStartedAt().toLocalDate();
                    return !d.isBefore(weekStart) && !d.isAfter(today);
                })
                .collect(Collectors.toList());

        int weeklyWorkoutCount = weeklySessions.size();
        int weeklyDurationMin = weeklySessions.stream()
                .mapToInt(s -> s.getTotalDurationSec() != null ? s.getTotalDurationSec() / 60 : 0)
                .sum();
        float weeklyCalories = (float) weeklySessions.stream()
                .mapToDouble(s -> s.getTotalCalories() != null ? s.getTotalCalories() : 0)
                .sum();

        // 진행률 계산 (횟수/시간/칼로리 평균)
        int goalProgressPercent = 0;
        int remainDurationMin = 0;
        float remainCalories = 0f;

        if (goal != null) {
            int countGoal   = goal.getWeeklyCount() != null ? goal.getWeeklyCount() : 0;
            int durationGoal = goal.getDurationMin() != null ? goal.getDurationMin() : 0;
            int calorieGoal = goal.getCalorieTarget() != null ? goal.getCalorieTarget() : 0;

            int countPercent    = countGoal > 0 ? Math.min(100, weeklyWorkoutCount * 100 / countGoal) : 100;
            int durationPercent = durationGoal > 0 ? Math.min(100, weeklyDurationMin * 100 / durationGoal) : 100;
            int caloriePercent  = calorieGoal > 0 ? Math.min(100, (int)(weeklyCalories * 100 / calorieGoal)) : 100;

            goalProgressPercent = (countPercent + durationPercent + caloriePercent) / 3;
            remainDurationMin   = Math.max(0, durationGoal - weeklyDurationMin);
            remainCalories      = Math.max(0f, calorieGoal - weeklyCalories);
        }

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
                .maxDuration(secToHms(maxSec))
                .maxWorkoutDays(maxStreak)
                .maxCalories(maxCalories)
                .avgDuration(secToHms((int) avgSec))
                .avgCalories((float) avgCalories)
                .friendCount(friendCount)
                .groupCount(groupCount)
                .weeklyWorkoutCount(weeklyWorkoutCount)
                .weeklyDurationMin(weeklyDurationMin)
                .weeklyCalories(weeklyCalories)
                .goalProgressPercent(goalProgressPercent)
                .remainDurationMin(remainDurationMin)
                .remainCalories(remainCalories)
                .build();
    }

    // ── 최대 연속 운동 일수 계산 ──────────────────────────
    private int calcMaxStreak(List<WorkoutSession> sessions) {
        if (sessions.isEmpty()) return 0;

        Set<LocalDate> dateSet = sessions.stream()
                .map(s -> s.getStartedAt().toLocalDate())
                .collect(Collectors.toSet());

        List<LocalDate> sorted = new ArrayList<>(dateSet);
        Collections.sort(sorted);

        int maxStreak = 1, cur = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i).minusDays(1).equals(sorted.get(i - 1))) {
                cur++;
                maxStreak = Math.max(maxStreak, cur);
            } else {
                cur = 1;
            }
        }
        return maxStreak;
    }

    // ── 초 → HH:mm:ss 포맷 ───────────────────────────────
    private String secToHms(int totalSec) {
        int h = totalSec / 3600;
        int m = (totalSec % 3600) / 60;
        int s = totalSec % 60;
        return String.format("%d:%02d:%02d", h, m, s);
    }
}
