package com.dumbbell.controller;

import com.dumbbell.dto.AiCoachingResponse;
import com.dumbbell.service.AiCoachingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// ── AiCoachingController ────────────────────────────────
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiCoachingController {

    private final AiCoachingService aiService;

    // POST /api/ai/coaching — AI 코칭 요청 (이미지 선택)
    @PostMapping(value = "/coaching", consumes = "multipart/form-data")
    public ResponseEntity<?> requestCoaching(
            Authentication auth,
            @RequestParam(required = false) String bodyDescription,
            @RequestParam(required = false) MultipartFile image) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(aiService.requestCoaching(userId, bodyDescription, image));
        } catch (Exception e) {
            return ResponseEntity.status(503).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // GET /api/ai/coaching/latest — 최근 코칭 결과 조회
    @GetMapping("/coaching/latest")
    public ResponseEntity<AiCoachingResponse> getLatest(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(aiService.getLatestCoaching(userId));
    }

    // GET /api/ai/coaching/history — AI 루틴 이력 전체 조회
    @GetMapping("/coaching/history")
    public ResponseEntity<?> getHistory(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(aiService.getCoachingHistory(userId));
    }

    // POST /api/ai/coaching/{logId}/apply — 추천 루틴을 현재 적용 루틴으로 지정
    @PostMapping("/coaching/{logId}/apply")
    public ResponseEntity<Void> applyRoutine(Authentication auth, @PathVariable Long logId) {
        Long userId = (Long) auth.getPrincipal();
        aiService.applyRoutine(userId, logId);
        return ResponseEntity.ok().build();
    }
}