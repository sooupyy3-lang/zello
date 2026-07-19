package com.dumbbell.exception;

// 요청 자체가 의미상 성립하지 않을 때(자기 자신 대상 액션 등) → HTTP 400
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
