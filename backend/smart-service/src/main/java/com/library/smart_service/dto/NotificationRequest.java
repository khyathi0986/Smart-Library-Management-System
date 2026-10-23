package com.library.smart_service.dto;
import jakarta.validation.constraints.*;
public record NotificationRequest(@NotNull Long userId,@NotBlank String type,@NotBlank @Size(max=1200) String message) {}
