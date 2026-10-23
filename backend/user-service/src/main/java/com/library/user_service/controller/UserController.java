
package com.library.user_service.controller;

import com.library.user_service.dto.RegisterRequest;
import com.library.user_service.dto.UserResponse;
import com.library.user_service.service.UserService;
import com.library.user_service.dto.LoginRequest;
import com.library.user_service.dto.LoginResponse;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        UserResponse response = userService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = userService.login(request);

        return ResponseEntity.ok(response);
    }
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(
            org.springframework.security.core.Authentication authentication) {

        UserResponse response =
                userService.getProfile(authentication.getName());

        return ResponseEntity.ok(response);
    }
}
