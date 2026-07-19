package com.dumbbell.exception;

// 권한이 없는 작업(방장 전용 액션 등)을 시도했을 때 → HTTP 403
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
