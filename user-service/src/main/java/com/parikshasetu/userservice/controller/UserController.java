package com.parikshasetu.userservice.controller;

import com.parikshasetu.userservice.model.User;
import com.parikshasetu.userservice.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/students")
    public List<User> getStudents() {
        return userService.getStudents();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/profile")
    public org.springframework.http.ResponseEntity<User> getProfile() {
        // Endpoint not yet implemented with security context
        return org.springframework.http.ResponseEntity.notFound().build();
    }

    @org.springframework.web.bind.annotation.PostMapping("/students/upload")
    public org.springframework.http.ResponseEntity<String> uploadStudents(
            @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        userService.bulkRegisterStudents(file);
        return org.springframework.http.ResponseEntity.ok("Students uploaded successfully");
    }

    @GetMapping("/students/template")
    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> downloadStudentTemplate() {
        java.io.ByteArrayInputStream in = userService.generateStudentTemplate();
        org.springframework.core.io.InputStreamResource file = new org.springframework.core.io.InputStreamResource(in);

        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=students_template.xlsx")
                .contentType(org.springframework.http.MediaType
                        .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @GetMapping("/search/email")
    public org.springframework.http.ResponseEntity<User> getUserByEmail(
            @org.springframework.web.bind.annotation.RequestParam("email") String email) {
        try {
            User user = userService.getUserByEmail(email);
            return org.springframework.http.ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
    }

    @org.springframework.web.bind.annotation.PostMapping("/batch")
    public List<User> getUsersByIds(@org.springframework.web.bind.annotation.RequestBody List<Long> ids) {
        return userService.getUsersByIds(ids);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return org.springframework.http.ResponseEntity.noContent().build();
    }
}
