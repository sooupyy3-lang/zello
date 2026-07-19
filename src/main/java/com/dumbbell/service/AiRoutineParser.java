package com.dumbbell.service;

import org.springframework.stereotype.Component;

// AI 응답 텍스트에서 ```json ... ``` 코드블록만 뽑아 추천 루틴 JSON으로 추출하는 것만 전담한다.
@Component
public class AiRoutineParser {

    public String extractRoutineJson(String aiResponse) {
        int codeStart = aiResponse.indexOf("```json");
        if (codeStart == -1) return null;

        int jsonStart = codeStart + "```json".length();
        int codeEnd = aiResponse.indexOf("```", jsonStart);
        if (codeEnd == -1) return null;

        return aiResponse.substring(jsonStart, codeEnd).trim();
    }
}
