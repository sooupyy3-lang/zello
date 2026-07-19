package com.dumbbell.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class GroupRequest {
    @NotBlank(message = "그룹명을 입력해주세요")
    @Size(max = 100, message = "그룹명은 100자 이하로 입력해주세요")
    private String name;

    @Size(max = 500, message = "그룹 소개는 500자 이하로 입력해주세요")
    private String description;

    @Size(max = 50, message = "카테고리는 50자 이하로 입력해주세요")
    private String category;

    @Size(max = 50, message = "목표는 50자 이하로 입력해주세요")
    private String goal;

    @Min(value = 1, message = "정원은 1명 이상이어야 해요")
    private Integer maxMembers;
}
