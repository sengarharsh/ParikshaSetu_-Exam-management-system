package com.parikshasetu.courseservice.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_enrollments")
@Data
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class CourseEnrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Long studentId;

    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status = EnrollmentStatus.PENDING; // Default PENDING

    private LocalDateTime enrolledAt = LocalDateTime.now();

    @Column(name = "is_approved", nullable = false)
    private boolean isApproved = false; // Legacy column support
}
