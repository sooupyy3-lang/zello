package com.dumbbell.controller;

import com.dumbbell.dto.UserProfileResponse;
import com.dumbbell.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    // GET /api/stats/me — 내 통계 조회
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyStats(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(statsService.getFullProfile(userId));
    }
}
