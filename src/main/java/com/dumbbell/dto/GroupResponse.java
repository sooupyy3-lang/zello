package com.dumbbell.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private String category;
    private String goal;
    private Integer maxMembers;
    private int memberCount;
    private String inviteCode;
    private String myRole;        // "owner" | "member" | null (미가입)
    private List<MemberInfo> members;

    @Getter
    @Builder
    public static class MemberInfo {
        private Long userId;
        private String name;
        private String role;
    }
}
