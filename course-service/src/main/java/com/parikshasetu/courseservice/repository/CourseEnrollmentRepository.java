package com.parikshasetu.courseservice.repository;

import com.parikshasetu.courseservice.model.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByStudentId(Long studentId);

    List<CourseEnrollment> findByCourseId(Long courseId);

    Optional<CourseEnrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
