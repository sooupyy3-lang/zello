package com.dumbbell.repository;

import com.dumbbell.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByName(String name);
    java.util.Optional<User> findByName(String name);
    java.util.Optional<User> findByKakaoId(String kakaoId);
}