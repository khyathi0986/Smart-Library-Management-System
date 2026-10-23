
package com.library.user_service.dto;

public class LoginResponse {

    private String token;
    private String tokenType;
    private UserResponse user;

    public LoginResponse(String token, UserResponse user) {
        this.token = token;
        this.tokenType = "Bearer";
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public UserResponse getUser() {
        return user;
    }
}
