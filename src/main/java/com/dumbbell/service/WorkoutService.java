package com.dumbbell.service;

import com.dumbbell.dto.*;
import com.dumbbell.entity.*;
import com.dumbbell.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutSessionRepository sessionRepo;
    private final WorkoutTrackRepository   trackRepo;
    private final ExerciseTypeRepository   exerciseTypeRepo;
    private final UserRepository           userRepo;
    private final UserGoalRepository       goalRepo;
    private final AiCoachingLogRepository  aiLogRepo;

    // ── 홈화면 데이터 ─────────────────────────────────────
    @Transactional(readOnly = true)
    public HomeResponse getHome(Long userId) {
        LocalDate today = LocalDate.now();

        // 이번 달 운동한 날짜
        List<WorkoutSession> monthSessions = sessionRepo.findByUserAndMonth(
                userId, today.getYear(), today.getMonthValue());
        List<String> workedOutDates = monthSessions.stream()
                .map(s -> s.getStartedAt().toLocalDate().toString())
                .distinct().collect(Collectors.toList());

        // 연속 운동 일수 계산
        int streak = calcStreak(workedOutDates, today);

        // 목표
        var goal = goalRepo.findTopByUserIdOrderByUpdatedAtDesc(userId).orElse(null);

        // 지금 운동 중인 친구
        List<WorkoutSession> friendSessions = sessionRepo.findActiveFriendSessions(userId);
        List<HomeResponse.ActiveFriendDto> activeFriends = friendSessions.stream()
                .map(s -> {
                    int totalSec = s.getTracks().stream()
                            .mapToInt(WorkoutTrack::getElapsedSec).sum();
                    float totalCal = s.getTotalCalories();
                    return HomeResponse.ActiveFriendDto.builder()
                            .userId(s.getUser().getId())
                            .name(s.getUser().getName())
                            .elapsedSec(totalSec)
                            .calories(totalCal)
                            .build();
                }).collect(Collectors.toList());

        // 최근 AI 추천 루틴 요약
        String aiSummary = aiLogRepo.findTopByUserIdOrderByCreatedAtDesc(userId)
                .map(AiCoachingLog::getRecommendedRoutine).orElse(null);

        String todayLabel = today.format(DateTimeFormatter.ofPattern("M.d.(E)", Locale.KOREAN));

        return HomeResponse.builder()
                .today(todayLabel)
                .streakDays(streak)
                .goalDurationMin(goal != null ? goal.getDurationMin() : 0)
                .goalCalorie(goal != null ? goal.getCalorieTarget() : 0)
                .activeFriends(activeFriends)
                .workedOutDates(workedOutDates)
                .aiRoutineSummary(aiSummary)
                .build();
    }

    // ── 운동 세션 시작 ────────────────────────────────────
    @Transactional
    public SessionResponse startSession(Long userId, SessionStartRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요"));

        // 이미 진행 중인 세션이 있으면 종료
        sessionRepo.findByUserIdAndIsActiveTrue(userId)
                .ifPresent(s -> { s.setIsActive(false); sessionRepo.save(s); });

        WorkoutSession session = WorkoutSession.builder()
                .user(user)
                .startedAt(LocalDateTime.now())
                .build();
        sessionRepo.save(session);

        // 트랙 생성 (선택한 운동 종류 순서대로)
        List<WorkoutTrack> tracks = new ArrayList<>();
        for (int i = 0; i < req.getExerciseTypeIds().size(); i++) {
            Long typeId = req.getExerciseTypeIds().get(i);
            ExerciseType et = exerciseTypeRepo.findById(typeId)
                    .orElseThrow(() -> new RuntimeException("운동 종류를 찾을 수 없어요"));
            tracks.add(WorkoutTrack.builder()
                    .session(session)
                    .exerciseType(et)
                    .trackOrder(i + 1)
                    .build());
        }
        trackRepo.saveAll(tracks);
        session.setTracks(tracks);

        return toSessionResponse(session);
    }

    // ── 트랙 상태 변경 (재생 / 일시정지) ─────────────────
    @Transactional
    public SessionResponse updateTrack(Long userId, Long trackId, TrackUpdateRequest req) {
        WorkoutTrack track = trackRepo.findById(trackId)
                .orElseThrow(() -> new RuntimeException("트랙을 찾을 수 없어요"));

        track.setStatus(req.getStatus());
        track.setElapsedSec(req.getElapsedSec());

        if (req.getStatus() == WorkoutTrack.TrackStatus.running) {
            track.setStartedAt(track.getStartedAt() == null ? LocalDateTime.now() : track.getStartedAt());
            track.setPausedAt(null);
        } else if (req.getStatus() == WorkoutTrack.TrackStatus.paused) {
            track.setPausedAt(LocalDateTime.now());
        }

        // 칼로리 재계산
        User user = userRepo.findById(userId).orElseThrow();
        track.recalcCalories(user.getWeightKg());
        trackRepo.save(track);

        // 세션 합계 갱신
        WorkoutSession session = track.getSession();
        float totalCal = (float) session.getTracks().stream()
                .mapToDouble(WorkoutTrack::getCalories).sum();
        int   totalSec = session.getTracks().stream()
                .mapToInt(WorkoutTrack::getElapsedSec).sum();
        session.setTotalCalories(totalCal);
        session.setTotalDurationSec(totalSec);
        sessionRepo.save(session);

        return toSessionResponse(session);
    }

    // ── 운동 종료 ─────────────────────────────────────────
    @Transactional
    public SessionResponse endSession(Long userId) {
        WorkoutSession session = sessionRepo.findByUserIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new RuntimeException("진행 중인 세션이 없어요"));
        session.setIsActive(false);
        session.setEndedAt(LocalDateTime.now());
        sessionRepo.save(session);
        return toSessionResponse(session);
    }

    // ── 특정 날 운동 기록 조회 ────────────────────────────
    @Transactional(readOnly = true)
    public SessionResponse getSessionByDate(Long userId, LocalDate date) {
        List<WorkoutSession> sessions = sessionRepo.findByUserAndMonth(
                userId, date.getYear(), date.getMonthValue());
        return sessions.stream()
                .filter(s -> s.getStartedAt().toLocalDate().equals(date))
                .findFirst()
                .map(this::toSessionResponse)
                .orElseThrow(() -> new RuntimeException("해당 날짜의 운동 기록이 없어요"));
    }

    // ── 운동 종류 목록 (카테고리별) ───────────────────────
    @Transactional(readOnly = true)
    public List<ExerciseType> getExerciseTypes(String category) {
        return category != null
                ? exerciseTypeRepo.findByCategory(category)
                : exerciseTypeRepo.findAll();
    }

    // ── 내부 헬퍼: 연속 운동 일수 계산 ──────────────────
    private int calcStreak(List<String> dates, LocalDate today) {
        Set<LocalDate> dateSet = dates.stream()
                .map(LocalDate::parse).collect(Collectors.toSet());
        int streak = 0;
        LocalDate cursor = today;
        while (dateSet.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    // ── 내부 헬퍼: Session → DTO ──────────────────────────
    private SessionResponse toSessionResponse(WorkoutSession s) {
        List<SessionResponse.TrackDto> trackDtos = s.getTracks().stream()
                .map(t -> SessionResponse.TrackDto.builder()
                        .trackId(t.getId())
                        .exerciseTypeId(t.getExerciseType().getId())
                        .exerciseName(t.getExerciseType().getName())
                        .category(t.getExerciseType().getCategory())
                        .trackOrder(t.getTrackOrder())
                        .status(t.getStatus().name())
                        .elapsedSec(t.getElapsedSec())
                        .calories(t.getCalories())
                        .build())
                .collect(Collectors.toList());

        return SessionResponse.builder()
                .sessionId(s.getId())
                .isActive(s.getIsActive())
                .totalDurationSec(s.getTotalDurationSec())
                .totalCalories(s.getTotalCalories())
                .startedAt(s.getStartedAt())
                .tracks(trackDtos)
                .build();
    }
}
