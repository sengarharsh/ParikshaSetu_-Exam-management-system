package com.parikshasetu.submissionservice.controller;

import com.parikshasetu.submissionservice.model.ExamLog;
import com.parikshasetu.submissionservice.model.Submission;
import com.parikshasetu.submissionservice.service.SubmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping("/start")
    public ResponseEntity<Submission> startExam(@RequestParam Long examId, @RequestParam Long studentId) {
        return ResponseEntity.ok(submissionService.startExam(examId, studentId));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Submission> submitExam(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(submissionService.submitExam(id, body.get("score")));
    }

    @PostMapping("/log")
    public ResponseEntity<Void> logViolation(@RequestBody ExamLog log) {
        submissionService.logViolation(log.getSubmissionId(), log.getStudentId(), log.getExamId(),
                log.getViolationType());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<ExamLog>> getLogs(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getLogs(id));
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long examId) {
        return ResponseEntity.ok(submissionService.getSubmissionsForExam(examId));
    }
}
