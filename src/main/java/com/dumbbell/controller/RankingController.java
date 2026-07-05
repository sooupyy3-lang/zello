package com.dumbbell.controller;

import com.dumbbell.dto.RankingResponse;
import com.dumbbell.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final WorkoutSessionRepository sessionRepo;

    // GET /api/rankings?type=time|goal|attendance
    @GetMapping
    public ResponseEntity<List<RankingResponse>> getRanking(
            @RequestParam(defaultValue = "time") String type) {

        List<RankingResponse> list = switch (type) {
            case "goal"       -> sessionRepo.findRankingByGoalAchievement();
            case "attendance" -> sessionRepo.findRankingByAttendance();
            default           -> sessionRepo.findRankingByTotalTime();
        };

        AtomicInteger rank = new AtomicInteger(1);
        list.forEach(r -> r.setRank(rank.getAndIncrement()));

        return ResponseEntity.ok(list);
    }
}
