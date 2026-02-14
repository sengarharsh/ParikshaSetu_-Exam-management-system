package com.parikshasetu.resultservice.service;

import com.parikshasetu.resultservice.model.Result;
import com.parikshasetu.resultservice.repository.ResultRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResultService {

    private final ResultRepository resultRepository;
    private final com.parikshasetu.resultservice.repository.SubmissionRepository submissionRepository;
    private final com.parikshasetu.resultservice.repository.ExamLogRepository examLogRepository;

    public ResultService(ResultRepository resultRepository,
            com.parikshasetu.resultservice.repository.SubmissionRepository submissionRepository,
            com.parikshasetu.resultservice.repository.ExamLogRepository examLogRepository) {
        this.resultRepository = resultRepository;
        this.submissionRepository = submissionRepository;
        this.examLogRepository = examLogRepository;
    }

    public com.parikshasetu.resultservice.model.Submission startExam(Long examId, Long studentId) {
        com.parikshasetu.resultservice.model.Submission submission = new com.parikshasetu.resultservice.model.Submission();
        submission.setExamId(examId);
        submission.setStudentId(studentId);
        submission.setStartTime(LocalDateTime.now());
        return submissionRepository.save(submission);
    }

    public com.parikshasetu.resultservice.model.Submission submitExam(Long submissionId, Integer score) {
        com.parikshasetu.resultservice.model.Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setSubmitTime(LocalDateTime.now());
        submission.setScore(score);

        com.parikshasetu.resultservice.model.Submission saved = submissionRepository.save(submission);

        // Generate Result immediately
        generateResult(saved.getStudentId(), saved.getExamId(), score, 100); // 100 is hardcoded for now

        return saved;
    }

    public void logViolation(Long submissionId, Long studentId, Long examId, String violationType) {
        com.parikshasetu.resultservice.model.ExamLog log = new com.parikshasetu.resultservice.model.ExamLog(
                submissionId, studentId, examId, violationType);
        examLogRepository.save(log);
    }

    public List<com.parikshasetu.resultservice.model.ExamLog> getLogs(Long submissionId) {
        return examLogRepository.findBySubmissionId(submissionId);
    }

    public Result generateResult(Long studentId, Long examId, Integer score, Integer totalMarks) {
        Result result = new Result();
        result.setStudentId(studentId);
        result.setExamId(examId);
        result.setScore(score);
        result.setTotalMarks(totalMarks);
        result.setGeneratedDate(LocalDateTime.now());

        // Calculate Grade
        double percentage = ((double) score / totalMarks) * 100;
        if (percentage >= 90)
            result.setGrade("A");
        else if (percentage >= 75)
            result.setGrade("B");
        else if (percentage >= 50)
            result.setGrade("C");
        else
            result.setGrade("F");

        return resultRepository.save(result);
    }

    public List<Result> getStudentResults(Long studentId) {
        return resultRepository.findByStudentId(studentId);
    }

    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    public List<Result> getResultsByExamId(Long examId) {
        return resultRepository.findByExamId(examId);
    }

    public List<Result> getResultsByExamIds(List<Long> examIds) {
        return resultRepository.findByExamIdIn(examIds);
    }
}
