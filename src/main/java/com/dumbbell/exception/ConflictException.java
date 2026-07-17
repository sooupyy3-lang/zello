package com.dumbbell.exception;

// 현재 상태와 충돌하는 요청(이미 가입됨, 정원 초과 등) → HTTP 409
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
