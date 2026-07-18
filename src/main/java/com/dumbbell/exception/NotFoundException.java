package com.dumbbell.exception;

// 요청한 리소스(그룹, 유저, 트랙 등)를 찾을 수 없을 때 → HTTP 404
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
