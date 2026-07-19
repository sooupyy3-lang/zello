package com.dumbbell.service;

import com.dumbbell.dto.RankingResponse;
import com.dumbbell.dto.UserProfileResponse;
import com.dumbbell.entity.*;
import com.dumbbell.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.DayOfWeek;
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

        // 날짜별 합산 (하루에 세션이 여러 개면 하나의 "하루 실적"으로 합침)
        Map<LocalDate, Integer> dailyDurationSec = sumDurationByDate(weeklySessions);
        Map<LocalDate, Float> dailyCalories = sumCaloriesByDate(weeklySessions);

        // 오늘의 목표 시간/칼로리 (하루 단위 — durationMin/calorieTarget은 1회=하루 기준 목표값)
        int goalProgressPercent = 0;
        int remainDurationMin = 0;
        float remainCalories = 0f;

        if (goal != null) {
            int durationGoal = goal.getDurationMin() != null ? goal.getDurationMin() : 0;
            int calorieGoal  = goal.getCalorieTarget() != null ? goal.getCalorieTarget() : 0;

            int todayDurationMin = dailyDurationSec.getOrDefault(today, 0) / 60;
            float todayCalories  = dailyCalories.getOrDefault(today, 0f);
            remainDurationMin = Math.max(0, durationGoal - todayDurationMin);
            remainCalories    = Math.max(0f, calorieGoal - todayCalories);

            goalProgressPercent = calcGoalProgressPercent(goal, dailyDurationSec, dailyCalories);
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

    // ── 목표 달성순 랭킹 (마이페이지와 동일한 '이번 주 목표 진행률' 기준) ──
    @Transactional(readOnly = true)
    public List<RankingResponse> getGoalProgressRanking() {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);

        List<RankingResponse> result = new ArrayList<>();
        for (User user : userRepo.findAll()) {
            UserGoal goal = goalRepo.findTopByUserIdOrderByUpdatedAtDesc(user.getId()).orElse(null);
            if (goal == null) continue;

            // 마이페이지(getFullProfile)와 동일하게 계산 — 필터 조건도 그대로 맞춤
            List<WorkoutSession> weeklySessions = sessionRepo.findAllByUserId(user.getId()).stream()
                    .filter(s -> {
                        LocalDate d = s.getStartedAt().toLocalDate();
                        return !d.isBefore(weekStart) && !d.isAfter(today);
                    })
                    .collect(Collectors.toList());
            if (weeklySessions.isEmpty()) continue;

            int percent = calcGoalProgressPercent(goal,
                    sumDurationByDate(weeklySessions), sumCaloriesByDate(weeklySessions));
            result.add(RankingResponse.builder()
                    .userId(user.getId())
                    .userName(user.getName())
                    .value((long) percent)
                    .build());
        }

        result.sort(Comparator.comparingLong(RankingResponse::getValue).reversed());
        return result;
    }

    // 날짜별 (시간% + 칼로리%)/2 의 평균을 주 목표 횟수로 나눈 진행률 — 운동 안 한 날은 0점 처리되어 횟수까지 함께 반영됨
    private int calcGoalProgressPercent(UserGoal goal, Map<LocalDate, Integer> dailyDurationSec, Map<LocalDate, Float> dailyCalories) {
        int countGoal    = goal.getWeeklyCount() != null ? goal.getWeeklyCount() : 0;
        int durationGoal = goal.getDurationMin() != null ? goal.getDurationMin() : 0;
        int calorieGoal  = goal.getCalorieTarget() != null ? goal.getCalorieTarget() : 0;

        double dailyScoreSum = 0;
        for (LocalDate d : dailyDurationSec.keySet()) {
            int durMin = dailyDurationSec.getOrDefault(d, 0) / 60;
            float cal = dailyCalories.getOrDefault(d, 0f);
            double durPercent = durationGoal > 0 ? Math.min(100.0, durMin * 100.0 / durationGoal) : 100.0;
            double calPercent = calorieGoal > 0 ? Math.min(100.0, cal * 100.0 / calorieGoal) : 100.0;
            dailyScoreSum += (durPercent + calPercent) / 2.0;
        }
        int sessionsGoal = Math.max(countGoal, 1);
        return (int) Math.min(100, dailyScoreSum / sessionsGoal);
    }

    private Map<LocalDate, Integer> sumDurationByDate(List<WorkoutSession> sessions) {
        Map<LocalDate, Integer> map = new HashMap<>();
        for (WorkoutSession s : sessions) {
            LocalDate d = s.getStartedAt().toLocalDate();
            map.merge(d, s.getTotalDurationSec() != null ? s.getTotalDurationSec() : 0, Integer::sum);
        }
        return map;
    }

    private Map<LocalDate, Float> sumCaloriesByDate(List<WorkoutSession> sessions) {
        Map<LocalDate, Float> map = new HashMap<>();
        for (WorkoutSession s : sessions) {
            LocalDate d = s.getStartedAt().toLocalDate();
            map.merge(d, s.getTotalCalories() != null ? s.getTotalCalories() : 0f, Float::sum);
        }
        return map;
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
