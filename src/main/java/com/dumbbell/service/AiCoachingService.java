package com.dumbbell.service;

import com.dumbbell.dto.*;
import com.dumbbell.entity.*;
import com.dumbbell.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// AI 코칭 요청을 프롬프트 조립 → OpenAI 호출 → 루틴 파싱 → 로그 저장 순으로 조합하는 오케스트레이션만 담당한다.
// 각 단계의 실제 구현은 AiPromptBuilder / OpenAiCoachingClient / AiRoutineParser에 위임한다.
@Service
@RequiredArgsConstructor
public class AiCoachingService {

    private final AiCoachingLogRepository aiLogRepo;
    private final UserRepository          userRepo;
    private final AiPromptBuilder         promptBuilder;
    private final OpenAiCoachingClient    openAiClient;
    private final AiRoutineParser         routineParser;

    @Transactional
    public AiCoachingResponse requestCoaching(Long userId, String bodyDescription, MultipartFile image) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없어요"));

        String prompt = promptBuilder.build(user, bodyDescription);
        String aiResponse = openAiClient.chat(prompt, image);
        String routineJson = routineParser.extractRoutineJson(aiResponse);

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

    @Transactional
    public void applyRoutine(Long userId, Long logId) {
        AiCoachingLog log = aiLogRepo.findById(logId)
                .orElseThrow(() -> new RuntimeException("코칭 기록을 찾을 수 없어요"));
        if (!log.getUser().getId().equals(userId)) {
            throw new RuntimeException("본인의 코칭 기록만 적용할 수 있어요");
        }
        aiLogRepo.findByUserIdAndAppliedTrue(userId)
                .forEach(prev -> prev.setApplied(false));
        log.setApplied(true);
    }
}
