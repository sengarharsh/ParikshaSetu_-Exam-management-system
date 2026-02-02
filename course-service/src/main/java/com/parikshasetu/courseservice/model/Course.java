package com.parikshasetu.courseservice.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Data
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private Long teacherId;

    private String teacherName;

    @Column(unique = true)
    private String code; // Unique code for students to join

    private LocalDateTime createdAt = LocalDateTime.now();
}
