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

    private final AiCoachingLogRepository aiLogRepo;
    private final UserRepository          userRepo;
    private final RestTemplate            restTemplate;

    // application.yml에 google.gemini.api-key로 저장하세요
    @Value("${google.gemini.api-key}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    @Transactional
    public AiCoachingResponse requestCoaching(Long userId, String bodyDescription, MultipartFile image) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요"));

        String prompt = buildPrompt(user, bodyDescription);

        // Gemini 호출 (이미지 유무에 따라 내부 로직 분기)
        String aiResponse = callGemini(prompt, image);

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

    // ── Gemini API 호출 통합 (텍스트 + 이미지) ──────────────────
    private String callGemini(String prompt, MultipartFile image) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 1. 요청 본문(Contents) 구성
            List<Map<String, Object>> parts = new ArrayList<>();

            // 텍스트 파트 추가
            parts.add(Map.of("text", prompt));

            // 이미지 파트 추가 (있는 경우)
            if (image != null && !image.isEmpty()) {
                String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
                String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";

                parts.add(Map.of(
                        "inline_data", Map.of(
                                "mime_type", mimeType,
                                "data", base64Image
                        )
                ));
            }

            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", parts)),
                    "generationConfig", Map.of(
                            "maxOutputTokens", 2048,
                            "temperature", 0.7
                    )
            );

            HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> res = restTemplate.postForEntity(GEMINI_API_URL + geminiApiKey, req, Map.class);

            return extractGeminiText(res.getBody());

        } catch (Exception e) {
            log.error("Gemini API 호출 실패: {}", e.getMessage(), e);
            throw new RuntimeException("AI 코칭 중 오류가 발생했습니다. 원인: " + e.getMessage());
        }
    }

    // ── Gemini 응답 구조에서 텍스트 추출 ───────────────────────
    @SuppressWarnings({"unchecked", "rawtypes"})
    private String extractGeminiText(Map body) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.error("Gemini 응답 파싱 에러", e);
            throw new RuntimeException("AI 응답을 읽을 수 없습니다.");
        }
    }

    // buildPrompt와 extractRoutineJson 로직은 기존과 동일하게 유지하거나
    // Gemini의 특성에 맞춰 프롬프트를 조금 더 다듬으셔도 됩니다.
    private String buildPrompt(User user, String bodyDescription) {
        return String.format("""
        당신은 전문 피트니스 트레이너입니다. 사용자의 신체 정보와 사진(있는 경우)을 바탕으로 아래 형식으로 코칭을 작성하세요.

        [사용자 정보]
        - 성별: %s
        - 키: %.0fcm / 몸무게: %.0fkg
        - 체형 고민: %s

        [출력 형식 - 반드시 준수]
        인사말, 전달 멘트 없이 아래 순서대로만 작성하세요.

        **체형 분석**
        사진과 신체 정보를 바탕으로 현재 체형 상태를 2~3문장으로 분석하세요.

        **AI 운동 코칭**
        체형 분석 결과와 사용자가 직접 입력한 체형 고민을 모두 반영하여 추천 운동 방향과 이유를 3~5문장으로 작성하세요.
        고민사항이 있는 경우 그 부위를 집중 개선할 수 있는 운동을 우선 추천하세요.
        핵심 운동명은 **운동명** 형식으로 강조하세요.

        **추천 운동 루틴**
        체형 분석과 고민사항을 모두 반영한 운동 5~7개를 아래 JSON 형식으로 반드시 포함하세요:
        ```json
        {"routines":[{"name":"운동명","sets":세트수,"reps":"횟수 또는 시간"}]}
        ```
        """,
                "female".equalsIgnoreCase(user.getGender().name()) ? "여성" : "남성",
                user.getHeightCm(),
                user.getWeightKg(),
                bodyDescription != null && !bodyDescription.isBlank() ? bodyDescription : "없음"
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
