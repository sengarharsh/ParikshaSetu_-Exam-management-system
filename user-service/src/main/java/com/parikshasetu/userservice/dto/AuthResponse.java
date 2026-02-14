package com.parikshasetu.userservice.dto;

public class AuthResponse {
    private Long id;
    private String accessToken;
    private String refreshToken;
    private String fullName;
    private String role;
    private String email;

    public AuthResponse(Long id, String accessToken, String refreshToken, String role, String email, String fullName) {
        this.id = id;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.role = role;
        this.email = email;
        this.fullName = fullName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Getters and Setters
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}
