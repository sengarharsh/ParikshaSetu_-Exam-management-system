package com.parikshasetu.userservice.controller;

import com.parikshasetu.userservice.dto.RegisterRequest;
import com.parikshasetu.userservice.model.User;
import com.parikshasetu.userservice.model.Role;
import com.parikshasetu.userservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setVerified(true); // Admins create verified users directly

        return ResponseEntity.ok(userService.createUser(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<String> approveUser(@PathVariable Long id) {
        userService.approveUser(id);
        return ResponseEntity.ok("User approved successfully");
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userService.countUsers());
        stats.put("students", userService.countByRole(Role.STUDENT));
        stats.put("teachers", userService.countByRole(Role.TEACHER));
        return ResponseEntity.ok(stats);
    }
}
