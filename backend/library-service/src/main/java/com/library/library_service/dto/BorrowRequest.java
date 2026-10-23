package com.library.library_service.dto;
import jakarta.validation.constraints.NotNull;
public record BorrowRequest(@NotNull Long userId, @NotNull Long bookId) {}
