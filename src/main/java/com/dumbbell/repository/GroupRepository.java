package com.dumbbell.repository;

import com.dumbbell.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {

    Optional<Group> findByInviteCode(String inviteCode);

    @Query("SELECT g FROM Group g WHERE g.name LIKE %:keyword% OR g.category LIKE %:keyword%")
    List<Group> searchByKeyword(@Param("keyword") String keyword);
}
