package com.dumbbell.service;

import com.dumbbell.dto.*;
import com.dumbbell.entity.*;
import com.dumbbell.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkoutService {

    // 이 시간(시) 이상 연속으로 켜져 있으면 좀비 세션으로 간주해 자동 종료하고 랭킹에서 제외
    private static final int MAX_CONTINUOUS_HOURS = 3;

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

        // 오늘 끝난 세션들의 누적 시간 (진행 중인 세션은 별도로 클라이언트가 실시간으로 더함)
        int todayDurationSec = monthSessions.stream()
                .filter(s -> !s.getIsActive() && s.getStartedAt().toLocalDate().equals(today))
                .mapToInt(s -> s.getTotalDurationSec() != null ? s.getTotalDurationSec() : 0)
                .sum();

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
                .todayDurationSec(todayDurationSec)
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
        closeSession(session, LocalDateTime.now());
        return toSessionResponse(session);
    }

    // ── 3시간 이상 방치된 세션 자동 종료 (좀비 세션 정리) ──
    // 5분마다 실행: 앱을 안 끄고 계속 켜둔 채 잊어버린 세션을 찾아 자동으로 마감한다.
    @Scheduled(fixedRate = 5 * 60 * 1000)
    @Transactional
    public void autoEndStaleSessions() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(MAX_CONTINUOUS_HOURS);
        List<WorkoutSession> stale = sessionRepo.findActiveSessionsStartedBefore(cutoff);
        for (WorkoutSession session : stale) {
            closeSession(session, session.getStartedAt().plusHours(MAX_CONTINUOUS_HOURS));
            log.info("좀비 세션 자동 종료: sessionId={}, userId={}", session.getId(), session.getUser().getId());
        }
    }

    // 세션을 종료 처리한다. 시작 시각부터 MAX_CONTINUOUS_HOURS를 넘겼다면
    // 그 시점에서 기록을 끊고(더 이상 누적되지 않게) 랭킹 집계에서 제외한다.
    private void closeSession(WorkoutSession session, LocalDateTime endedAt) {
        LocalDateTime cap = session.getStartedAt().plusHours(MAX_CONTINUOUS_HOURS);
        boolean tooLong = endedAt.isAfter(cap);

        session.setIsActive(false);
        session.setEndedAt(tooLong ? cap : endedAt);

        if (tooLong) {
            session.setExcludedFromRanking(true);
            for (WorkoutTrack track : session.getTracks()) {
                if (track.getStatus() == WorkoutTrack.TrackStatus.running) {
                    track.setStatus(WorkoutTrack.TrackStatus.paused);
                    track.setPausedAt(cap);
                    trackRepo.save(track);
                }
            }
        }
        sessionRepo.save(session);
    }

    // ── 특정 날 운동 기록 조회 ────────────────────────────
    // 하루에 "운동 시작하기"를 여러 번 눌러 세션이 여러 개 생겼을 수 있어서,
    // 그날 해당하는 모든 세션을 합산해서 보여준다 (하나만 고르면 나머지가 누락됨).
    @Transactional(readOnly = true)
    public SessionResponse getSessionByDate(Long userId, LocalDate date) {
        List<WorkoutSession> sessions = sessionRepo.findByUserAndMonth(
                        userId, date.getYear(), date.getMonthValue())
                .stream()
                .filter(s -> s.getStartedAt().toLocalDate().equals(date))
                .toList();

        if (sessions.isEmpty()) {
            return SessionResponse.builder()
                    .isActive(false)
                    .totalDurationSec(0)
                    .totalCalories(0f)
                    .tracks(List.of())
                    .build();
        }

        int totalDurationSec = sessions.stream()
                .mapToInt(s -> s.getTotalDurationSec() == null ? 0 : s.getTotalDurationSec())
                .sum();
        float totalCalories = (float) sessions.stream()
                .mapToDouble(s -> s.getTotalCalories() == null ? 0f : s.getTotalCalories())
                .sum();
        List<SessionResponse.TrackDto> tracks = sessions.stream()
                .flatMap(s -> s.getTracks().stream())
                .map(this::toTrackDto)
                .collect(Collectors.toList());
        // findByUserAndMonth는 startedAt DESC 정렬이라, 필터링 후 마지막 원소가 그날 중 가장 이른 세션
        WorkoutSession earliest = sessions.get(sessions.size() - 1);

        return SessionResponse.builder()
                .isActive(sessions.stream().anyMatch(WorkoutSession::getIsActive))
                .totalDurationSec(totalDurationSec)
                .totalCalories(totalCalories)
                .startedAt(earliest.getStartedAt())
                .tracks(tracks)
                .userWeightKg(earliest.getUser().getWeightKg())
                .build();
    }

    // ── 운동 종류 목록 (카테고리별) ───────────────────────
    @Transactional(readOnly = true)
    public List<ExerciseType> getExerciseTypes(String category) {
        return category != null
                ? exerciseTypeRepo.findByCategory(category)
                : exerciseTypeRepo.findAll();
    }

    // ── 카테고리 목록 ──────────────────────────────────────
    @Transactional(readOnly = true)
    public List<String> getCategories() {
        return exerciseTypeRepo.findAllCategories();
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

    // ── 내부 헬퍼: Track → DTO ──────────────────────────
    private SessionResponse.TrackDto toTrackDto(WorkoutTrack t) {
        return SessionResponse.TrackDto.builder()
                .trackId(t.getId())
                .exerciseTypeId(t.getExerciseType().getId())
                .exerciseName(t.getExerciseType().getName())
                .category(t.getExerciseType().getCategory())
                .trackOrder(t.getTrackOrder())
                .status(t.getStatus().name())
                .elapsedSec(t.getElapsedSec())
                .calories(t.getCalories())
                .metValue(t.getExerciseType().getMetValue())
                .build();
    }

    // ── 내부 헬퍼: Session → DTO ──────────────────────────
    private SessionResponse toSessionResponse(WorkoutSession s) {
        List<SessionResponse.TrackDto> trackDtos = s.getTracks().stream()
                .map(this::toTrackDto)
                .collect(Collectors.toList());

        return SessionResponse.builder()
                .sessionId(s.getId())
                .isActive(s.getIsActive())
                .totalDurationSec(s.getTotalDurationSec())
                .totalCalories(s.getTotalCalories())
                .startedAt(s.getStartedAt())
                .tracks(trackDtos)
                .userWeightKg(s.getUser().getWeightKg())
                .build();
    }
}
