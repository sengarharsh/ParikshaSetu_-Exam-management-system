package com.parikshasetu.submissionservice.repository;

import com.parikshasetu.submissionservice.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByExamId(Long examId);

    List<Submission> findByStudentId(Long studentId);
}
