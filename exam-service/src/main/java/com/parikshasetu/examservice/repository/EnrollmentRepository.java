package com.parikshasetu.examservice.repository;

import com.parikshasetu.examservice.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentId(Long studentId);

    boolean existsByStudentIdAndExamId(Long studentId, Long examId);
}
