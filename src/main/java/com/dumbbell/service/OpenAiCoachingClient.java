package com.dumbbell.service;

import com.dumbbell.exception.AiServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;

// OpenAI Chat Completions API 호출만 전담한다 (요청 조립 + 응답 텍스트 추출).
@Slf4j
@Component
@RequiredArgsConstructor
public class OpenAiCoachingClient {

    private final RestTemplate restTemplate;

    @Value("${openai.api-key}")
    private String openaiApiKey;

    private static final String CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
    private static final String MODEL = "gpt-4.1-mini";

    private static final String SYSTEM_PROMPT =
            "당신은 한국어 전문 피트니스 트레이너입니다. 반드시 한글로만 답변하세요. " +
            "한자(漢字), 중국어, 일본어 문자는 절대 사용하지 마세요. " +
            "영어 고유명사(Russian, Deadlift 등)는 한글 외래어 표기(러시안, 데드리프트)로 바꾸세요. " +
            "단어 앞에 대시(-), 밑줄(_) 같은 기호를 붙이지 마세요.";

    public String chat(String prompt, MultipartFile image) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            Object userContent = (image != null && !image.isEmpty())
                    ? buildMultimodalContent(prompt, image)
                    : prompt;

            Map<String, Object> body = Map.of(
                    "model", MODEL,
                    "messages", List.of(
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", userContent)
                    ),
                    "max_tokens", 2048,
                    "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> res = restTemplate.postForEntity(CHAT_COMPLETIONS_URL, req, Map.class);

            return extractMessageText(res.getBody());
        } catch (AiServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("OpenAI API 호출 실패: {}", e.getMessage(), e);
            throw new AiServiceException("AI 코칭 중 오류가 발생했습니다. 원인: " + e.getMessage(), e);
        }
    }

    private Object buildMultimodalContent(String prompt, MultipartFile image) throws Exception {
        String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        String mimeType = image.getContentType() != null ? image.getContentType() : "image/jpeg";
        return List.of(
                Map.of("type", "text", "text", prompt),
                Map.of("type", "image_url", "image_url",
                        Map.of("url", "data:" + mimeType + ";base64," + base64Image))
        );
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private String extractMessageText(Map body) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            log.error("OpenAI 응답 파싱 에러", e);
            throw new AiServiceException("AI 응답을 읽을 수 없습니다.", e);
        }
    }
}
