package com.parikshasetu.submissionservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "exam_logs")
public class ExamLog {
    @Id
    private String id;

    private Long submissionId;
    private Long studentId;
    private Long examId;
    private String violationType; // TAB_SWITCH, FACE_MISSING, etc.
    private LocalDateTime timestamp;

    public ExamLog(Long submissionId, Long studentId, Long examId, String violationType) {
        this.submissionId = submissionId;
        this.studentId = studentId;
        this.examId = examId;
        this.violationType = violationType;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public String getViolationType() {
        return violationType;
    }

    public void setViolationType(String violationType) {
        this.violationType = violationType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
