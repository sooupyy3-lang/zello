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
    public ResponseEntity<AiCoachingResponse> requestCoaching(
            Authentication auth,
            @RequestParam(required = false) String bodyDescription,
            @RequestParam(required = false) MultipartFile image) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(aiService.requestCoaching(userId, bodyDescription, image));
    }

    // GET /api/ai/coaching/latest — 최근 코칭 결과 조회
    @GetMapping("/coaching/latest")
    public ResponseEntity<AiCoachingResponse> getLatest(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(aiService.getLatestCoaching(userId));
    }
}