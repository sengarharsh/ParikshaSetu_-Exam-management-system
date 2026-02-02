package com.parikshasetu.submissionservice.service;

import com.parikshasetu.submissionservice.model.ExamLog;
import com.parikshasetu.submissionservice.model.Submission;
import com.parikshasetu.submissionservice.repository.ExamLogRepository;
import com.parikshasetu.submissionservice.repository.SubmissionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ExamLogRepository examLogRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public SubmissionService(SubmissionRepository submissionRepository, ExamLogRepository examLogRepository) {
        this.submissionRepository = submissionRepository;
        this.examLogRepository = examLogRepository;
    }

    public Submission startExam(Long examId, Long studentId) {
        Submission submission = new Submission();
        submission.setExamId(examId);
        submission.setStudentId(studentId);
        submission.setStartTime(LocalDateTime.now());
        return submissionRepository.save(submission);
    }

    public Submission submitExam(Long submissionId, Integer score) {

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setSubmitTime(LocalDateTime.now());
        submission.setScore(score);

        Submission saved = submissionRepository.save(submission);

        // Call Result Service
        try {
            Map<String, Object> req = new HashMap<>();

            req.put("studentId", saved.getStudentId());
            req.put("examId", saved.getExamId());
            req.put("score", score);
            req.put("totalMarks", 100); // later make dynamic

            restTemplate.postForObject(
                    "http://localhost:8084/api/results/generate",
                    req,
                    Object.class);

        } catch (Exception e) {
            System.out.println("Result service call failed: " + e.getMessage());
        }

        return saved;
    }

    public void logViolation(Long submissionId, Long studentId, Long examId, String violationType) {
        ExamLog log = new ExamLog(submissionId, studentId, examId, violationType);
        examLogRepository.save(log);
    }

    public List<ExamLog> getLogs(Long submissionId) {
        return examLogRepository.findBySubmissionId(submissionId);
    }

    public List<Submission> getSubmissionsForExam(Long examId) {
        return submissionRepository.findByExamId(examId);
    }
}
