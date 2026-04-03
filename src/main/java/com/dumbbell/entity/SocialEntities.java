package com.dumbbell.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// ── Friendship ──────────────────────────────────────────
@Entity
@Table(name = "friendships",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "friend_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Friendship {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "friend_id", nullable = false)
    private User friend;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FriendStatus status = FriendStatus.pending;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public enum FriendStatus { pending, accepted, blocked }
}

// ── Group ───────────────────────────────────────────────
@Entity
@Table(name = "`groups`")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Group {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}

// ── GroupMember ─────────────────────────────────────────
@Entity
@Table(name = "group_members",
       uniqueConstraints = @UniqueConstraint(columnNames = {"group_id", "user_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GroupMember {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MemberRole role = MemberRole.member;

    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist protected void onCreate() { this.joinedAt = LocalDateTime.now(); }

    public enum MemberRole { owner, member }
}

// ── AiCoachingLog ────────────────────────────────────────
@Entity
@Table(name = "ai_coaching_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiCoachingLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "body_description", columnDefinition = "TEXT")
    private String bodyDescription;

    @Column(name = "ai_response", columnDefinition = "TEXT")
    private String aiResponse;

    @Column(name = "recommended_routine", columnDefinition = "JSON")
    private String recommendedRoutine;   // JSON 문자열로 저장

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}
