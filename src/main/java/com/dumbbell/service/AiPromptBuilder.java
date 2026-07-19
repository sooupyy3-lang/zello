package com.dumbbell.service;

import com.dumbbell.entity.User;
import com.dumbbell.entity.WorkoutSession;
import com.dumbbell.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

// 유저 정보 + 최근 운동기록을 AI 코칭 요청 프롬프트로 조립하는 것만 전담한다.
@Component
@RequiredArgsConstructor
public class AiPromptBuilder {

    private static final int RECENT_SESSION_LIMIT = 10;

    private final WorkoutSessionRepository sessionRepo;

    public String build(User user, String bodyDescription) {
        String workoutSummary = buildWorkoutSummary(user.getId());
        return String.format("""
        당신은 전문 피트니스 트레이너입니다. 사용자의 신체 정보, 운동 기록, 사진(있는 경우)을 바탕으로 아래 형식으로 코칭을 작성하세요.

        [사용자 정보]
        - 성별: %s
        - 키: %.0fcm / 몸무게: %.0fkg
        - 체형 고민: %s

        [최근 운동 데이터]
        %s

        [출력 형식 - 반드시 준수]
        인사말, 전달 멘트 없이 아래 순서대로만 작성하세요.

        **체형 분석**
        사진과 신체 정보를 바탕으로 현재 체형 상태를 2~3문장으로 분석하세요.

        **AI 운동 코칭**
        체형 분석 결과, 운동 기록, 체형 고민을 모두 반영하여 추천 운동 방향과 이유를 3~5문장으로 작성하세요.
        최근 자주 한 운동과 부족한 부분을 분석해 균형 잡힌 루틴을 추천하세요.
        핵심 운동명은 **운동명** 형식으로 강조하세요.

        **추천 운동 루틴**
        체형 분석과 고민사항을 모두 반영한 운동 5~7개를 아래 JSON 형식으로 반드시 포함하세요:
        ```json
        {"routines":[{"name":"운동명","sets":세트수,"reps":"횟수 또는 시간","description":"운동 방법을 1~2문장으로 설명"}]}
        ```
        """,
                "female".equalsIgnoreCase(user.getGender().name()) ? "여성" : "남성",
                user.getHeightCm(),
                user.getWeightKg(),
                bodyDescription != null && !bodyDescription.isBlank() ? bodyDescription : "없음",
                workoutSummary
        );
    }

    private String buildWorkoutSummary(Long userId) {
        List<WorkoutSession> sessions = sessionRepo.findAllByUserId(userId).stream()
                .filter(s -> !s.getIsActive())
                .sorted((a, b) -> b.getStartedAt().compareTo(a.getStartedAt()))
                .limit(RECENT_SESSION_LIMIT)
                .toList();

        if (sessions.isEmpty()) return "운동 기록 없음";

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("최근 %d회 운동 기록:\n", sessions.size()));
        for (WorkoutSession s : sessions) {
            long minutes = s.getTotalDurationSec() / 60;
            int calories = s.getTotalCalories() != null ? s.getTotalCalories().intValue() : 0;
            List<String> exerciseNames = s.getTracks().stream()
                    .map(t -> t.getExerciseType().getName())
                    .distinct().toList();
            sb.append(String.format("- %s: %d분, %dkcal, 운동종목: %s\n",
                    s.getStartedAt().toLocalDate(), minutes, calories,
                    String.join("/", exerciseNames)));
        }
        return sb.toString();
    }
}
