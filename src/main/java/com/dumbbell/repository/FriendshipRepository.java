package com.dumbbell.repository;

import com.dumbbell.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    Optional<Friendship> findByUserIdAndFriendId(Long userId, Long friendId);
    List<Friendship> findByUserIdAndStatus(Long userId, Friendship.FriendStatus status);
    List<Friendship> findByFriendIdAndStatus(Long friendId, Friendship.FriendStatus status);
}
