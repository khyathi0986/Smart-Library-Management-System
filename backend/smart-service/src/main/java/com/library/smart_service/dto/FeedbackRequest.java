package com.library.smart_service.dto;
import jakarta.validation.constraints.*;
public record FeedbackRequest(@NotNull Long userId,@NotNull Long bookId,@NotBlank String bookTitle,@NotBlank String category,@Min(1) @Max(5) int rating,@Size(max=1500) String comment) {}
