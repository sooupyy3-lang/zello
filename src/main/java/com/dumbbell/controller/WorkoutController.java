package com.dumbbell.controller;

import com.dumbbell.dto.*;
import com.dumbbell.entity.ExerciseType;
import com.dumbbell.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    // 홈화면 데이터
    @GetMapping("/home")
    public ResponseEntity<HomeResponse> home(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(workoutService.getHome(userId));
    }

    // 운동 세션 시작
    @PostMapping("/sessions")
    public ResponseEntity<SessionResponse> startSession(Authentication auth,
                                                        @RequestBody SessionStartRequest req) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(workoutService.startSession(userId, req));
    }

    // 오늘 세션 조회
    @GetMapping("/sessions/today")
    public ResponseEntity<SessionResponse> todaySession(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(workoutService.getSessionByDate(userId, LocalDate.now()));
    }

    // 특정 날짜 조회
    @GetMapping("/sessions")
    public ResponseEntity<SessionResponse> sessionByDate(
            Authentication auth,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(workoutService.getSessionByDate(userId, date));
    }

    // 트랙 업데이트
    @PatchMapping("/tracks/{trackId}")
    public ResponseEntity<SessionResponse> updateTrack(
            Authentication auth,
            @PathVariable Long trackId,
            @RequestBody TrackUpdateRequest req) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(workoutService.updateTrack(userId, trackId, req));
    }

    // 운동 종료
    @PostMapping("/sessions/end")
    public ResponseEntity<SessionResponse> endSession(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ResponseEntity.ok(workoutService.endSession(userId));
    }

}

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
class ExerciseController {

    private final WorkoutService workoutService;

    // GET /api/exercises — 운동 종류 조회 (인증 불필요)
    @GetMapping
    public ResponseEntity<List<ExerciseType>> exercises(
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(workoutService.getExerciseTypes(category));
    }
}