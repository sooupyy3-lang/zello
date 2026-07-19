package com.dumbbell.controller;

import com.dumbbell.dto.LoginRequest;
import com.dumbbell.dto.RegisterRequest;
import com.dumbbell.dto.TokenResponse;
import com.dumbbell.service.KakaoService;
import com.dumbbell.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService  userService;
    private final KakaoService kakaoService;

    // 닉네임 중복 체크
    @GetMapping("/check-nickname")
    public ResponseEntity<?> checkNickname(@RequestParam String name) {
        boolean available = userService.isNicknameAvailable(name);
        return ResponseEntity.ok(java.util.Map.of("available", available));
    }

    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(userService.register(req));
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(userService.login(req));
    }

    // 카카오 로그인 URL 반환
    @GetMapping("/kakao/url")
    public ResponseEntity<Map<String, String>> kakaoUrl(@RequestParam String redirectUri) {
        return ResponseEntity.ok(Map.of("url", kakaoService.buildAuthUrl(redirectUri)));
    }

    // 카카오 로그인 처리 (code → JWT)
    @PostMapping("/kakao/login")
    public ResponseEntity<Map<String, Object>> kakaoLogin(
            @RequestParam String code,
            @RequestParam String redirectUri) {
        return ResponseEntity.ok(kakaoService.processLogin(code, redirectUri));
    }
}