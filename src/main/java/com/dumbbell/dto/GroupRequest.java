package com.dumbbell.dto;

import lombok.Getter;

@Getter
public class GroupRequest {
    private String name;
    private String description;
    private String category;
    private String goal;
    private Integer maxMembers;
}
