package com.library.smart_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FacultyRecommendationRequest(
    @NotNull Long facultyId,
    @NotBlank String facultyName,
    @NotNull Long bookId,
    @NotBlank String bookTitle,
    String author,
    String category,
    @NotBlank @Size(max = 1000) String reason
) {}
