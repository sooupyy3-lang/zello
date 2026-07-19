package com.dumbbell.exception;

// AI(OpenAI) 연동 실패(네트워크 오류, 응답 파싱 실패 등) → HTTP 503
public class AiServiceException extends RuntimeException {
    public AiServiceException(String message) {
        super(message);
    }

    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
