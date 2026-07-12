package com.dumbbell.service;

import com.dumbbell.dto.*;
import com.dumbbell.entity.*;
import com.dumbbell.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiCoachingService {

    private final AiCoachingLogRepository  aiLogRepo;
    private final UserRepository           userRepo;
    private final WorkoutSessionRepository sessionRepo;
    private final RestTemplate             restTemplate;

    @Value("${openai.api-key}")
    private String openaiApiKey;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL          = "gpt-4.1-mini";

    @Transactional
    public AiCoachingResponse requestCoaching(Long userId, String bodyDescription, MultipartFile image) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요"));

        String workoutSummary = buildWorkoutSummary(userId);
        String prompt = buildPrompt(user, bodyDescription, workoutSummary);

        String aiResponse = callGroq(prompt, image);

        String routineJson = extractRoutineJson(aiResponse);

        AiCoachingLog log = AiCoachingLog.builder()
                .user(user)
                .bodyDescription(bodyDescription)
                .aiResponse(aiResponse)
                .recommendedRoutine(routineJson)
                .build();
        aiLogRepo.save(log);

        return AiCoachingResponse.builder()
                .logId(log.getId())
                .aiResponse(aiResponse)
                .recommendedRoutine(routineJson)
                .build();
    }

    // ── Groq API 호출 (텍스트 + 이미지) ────────────────────────
    private String callGroq(String prompt, MultipartFile image) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            Object messageContent;

            if (image != null && !image.isEmpty()) {
                String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
                String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
                messageContent = List.of(
                        Map.of("type", "text", "text", prompt),
                        Map.of("type", "image_url", "image_url",
                                Map.of("url", "data:" + mimeType + ";base64," + base64Image))
                );
            } else {
                messageContent = prompt;
            }

            Map<String, Object> systemMessage = Map.of(
                    "role", "system",
                    "content", "당신은 한국어 전문 피트니스 트레이너입니다. 반드시 한글로만 답변하세요. 한자(漢字), 중국어, 일본어 문자는 절대 사용하지 마세요. 영어 고유명사(Russian, Deadlift 등)는 한글 외래어 표기(러시안, 데드리프트)로 바꾸세요. 단어 앞에 대시(-), 밑줄(_) 같은 기호를 붙이지 마세요."
            );
            Map<String, Object> userMessage = Map.of("role", "user", "content", messageContent);

            Map<String, Object> body = Map.of(
                    "model", MODEL,
                    "messages", List.of(systemMessage, userMessage),
                    "max_tokens", 2048,
                    "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> res = restTemplate.postForEntity(OPENAI_API_URL, req, Map.class);

            return extractGroqText(res.getBody());

        } catch (Exception e) {
            log.error("OpenAI API 호출 실패: {}", e.getMessage(), e);
            throw new RuntimeException("AI 코칭 중 오류가 발생했습니다. 원인: " + e.getMessage());
        }
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private String extractGroqText(Map body) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            log.error("OpenAI 응답 파싱 에러", e);
            throw new RuntimeException("AI 응답을 읽을 수 없습니다.");
        }
    }

    // buildPrompt와 extractRoutineJson 로직은 기존과 동일하게 유지하거나
    // Gemini의 특성에 맞춰 프롬프트를 조금 더 다듬으셔도 됩니다.
    private String buildWorkoutSummary(Long userId) {
        List<WorkoutSession> sessions = sessionRepo.findAllByUserId(userId).stream()
                .filter(s -> !s.getIsActive())
                .sorted((a, b) -> b.getStartedAt().compareTo(a.getStartedAt()))
                .limit(10)
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

    private String buildPrompt(User user, String bodyDescription, String workoutSummary) {
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

    public AiCoachingResponse getLatestCoaching(Long userId) {
        return aiLogRepo.findTopByUserIdOrderByCreatedAtDesc(userId)
                .map(log -> AiCoachingResponse.builder()
                        .logId(log.getId())
                        .aiResponse(log.getAiResponse())
                        .recommendedRoutine(log.getRecommendedRoutine())
                        .build())
                .orElseThrow(() -> new RuntimeException("코칭 기록이 없습니다."));
    }

    public List<AiCoachingResponse> getCoachingHistory(Long userId) {
        return aiLogRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(log -> AiCoachingResponse.builder()
                        .logId(log.getId())
                        .aiResponse(log.getAiResponse())
                        .recommendedRoutine(log.getRecommendedRoutine())
                        .createdAt(log.getCreatedAt())
                        .build())
                .toList();
    }

    private String extractRoutineJson(String aiResponse) {
        // 기존의 extractRoutineJson 로직을 그대로 사용하시면 됩니다.
        // (Markdown에서 ```json ... ``` 사이의 내용을 추출하는 로직)
        try {
            int codeStart = aiResponse.indexOf("```json");
            if (codeStart != -1) {
                int jsonStart = codeStart + 7;
                int codeEnd = aiResponse.indexOf("```", jsonStart);
                if (codeEnd != -1) {
                    return aiResponse.substring(jsonStart, codeEnd).trim();
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
