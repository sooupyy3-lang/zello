package com.dumbbell.controller;

import com.dumbbell.dto.RegisterRequest;
import com.dumbbell.dto.UserProfileResponse;
import com.dumbbell.service.StatsService;
import com.dumbbell.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService  userService;
    private final StatsService statsService;

    // GET /api/users/me — 내 프로필 조회
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMe(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(statsService.getFullProfile(userId));
    }

    // PUT /api/users/me — 프로필/목표 수정
    @PutMapping("/me")
    public ResponseEntity<Void> updateMe(Authentication auth,
                                         @Valid @RequestBody RegisterRequest req) {
        Long userId = (Long) auth.getPrincipal();
        userService.updateProfile(userId, req);
        return ResponseEntity.ok().build();
    }
}
