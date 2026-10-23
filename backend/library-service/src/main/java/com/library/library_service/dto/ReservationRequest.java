package com.library.library_service.dto;
import jakarta.validation.constraints.NotNull;
public record ReservationRequest(@NotNull Long userId, @NotNull Long bookId) {}
