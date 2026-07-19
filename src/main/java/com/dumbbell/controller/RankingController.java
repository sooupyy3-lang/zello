package com.dumbbell.controller;

import com.dumbbell.dto.RankingResponse;
import com.dumbbell.repository.WorkoutSessionRepository;
import com.dumbbell.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final WorkoutSessionRepository sessionRepo;
    private final StatsService statsService;

    // GET /api/rankings?type=time|goal|attendance
    @GetMapping
    public ResponseEntity<List<RankingResponse>> getRanking(
            @RequestParam(defaultValue = "time") String type) {

        List<RankingResponse> list = switch (type) {
            case "goal"       -> statsService.getGoalProgressRanking();
            case "attendance" -> sessionRepo.findRankingByAttendance();
            default           -> {
                LocalDateTime start = LocalDate.now().atStartOfDay();
                yield sessionRepo.findRankingByTotalTime(start, start.plusDays(1));
            }
        };

        AtomicInteger rank = new AtomicInteger(1);
        list.forEach(r -> r.setRank(rank.getAndIncrement()));

        return ResponseEntity.ok(list);
    }
}
