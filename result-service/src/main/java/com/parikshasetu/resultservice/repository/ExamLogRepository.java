package com.parikshasetu.resultservice.repository;

import com.parikshasetu.resultservice.model.ExamLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ExamLogRepository extends MongoRepository<ExamLog, String> {
    List<ExamLog> findBySubmissionId(Long submissionId);

    List<ExamLog> findByExamId(Long examId);
}
