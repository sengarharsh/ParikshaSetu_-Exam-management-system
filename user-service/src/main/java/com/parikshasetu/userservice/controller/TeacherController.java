package com.parikshasetu.userservice.controller;

import com.parikshasetu.userservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {

    private final UserService userService;

    public TeacherController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping(value = "/students/upload", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadStudents(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        try {
            userService.bulkRegisterStudents(file);
            return ResponseEntity.ok("Students uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload students: " + e.getMessage());
        }
    }
}
