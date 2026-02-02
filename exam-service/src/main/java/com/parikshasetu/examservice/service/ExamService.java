package com.parikshasetu.examservice.service;

import com.parikshasetu.examservice.dto.ExamDTO;
import com.parikshasetu.examservice.dto.QuestionDTO;
import com.parikshasetu.examservice.model.Exam;
import com.parikshasetu.examservice.model.Question;
import com.parikshasetu.examservice.repository.ExamRepository;
import com.parikshasetu.examservice.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final com.parikshasetu.examservice.repository.EnrollmentRepository enrollmentRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    public ExamService(ExamRepository examRepository, QuestionRepository questionRepository,
            com.parikshasetu.examservice.repository.EnrollmentRepository enrollmentRepository,
            org.springframework.web.client.RestTemplate restTemplate) {
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.restTemplate = restTemplate;
    }

    public Exam createExam(ExamDTO dto) {
        Exam exam = new Exam();
        exam.setTitle(dto.getTitle());
        exam.setDescription(dto.getDescription());
        exam.setDurationMinutes(dto.getDurationMinutes());
        exam.setTotalMarks(dto.getTotalMarks());
        exam.setTeacherId(dto.getTeacherId());
        exam.setCourseId(dto.getCourseId());
        exam.setScheduledTime(dto.getScheduledTime());
        exam.setActive(true);

        Exam savedExam = examRepository.save(exam);

        if (dto.getQuestions() != null && !dto.getQuestions().isEmpty()) {
            for (QuestionDTO qDto : dto.getQuestions()) {
                Question question = new Question();
                question.setText(qDto.getText());
                question.setOptionA(qDto.getOptionA());
                question.setOptionB(qDto.getOptionB());
                question.setOptionC(qDto.getOptionC());
                question.setOptionD(qDto.getOptionD());
                question.setCorrectOption(qDto.getCorrectOption());
                question.setMarks(qDto.getMarks());
                question.setExam(savedExam);
                questionRepository.save(question);
            }
        }
        return savedExam;
    }

    // NEW: Fetch exams for a student based on Course Enrollments + Direct
    // Enrollments
    public List<Exam> getExamsForStudent(Long studentId) {
        // 1. Get Direct Enrollments (Legacy support)
        List<Long> directExamIds = enrollmentRepository.findByStudentId(studentId)
                .stream().map(enrollment -> enrollment.getExamId()).toList();

        List<Exam> exams = examRepository.findAllById(directExamIds);

        // 2. Fetch Course Enrollments from Course Service
        try {
            // We need a DTO to map the response, or just use Object/Map
            // Response is List<CourseEnrollment>
            // Ideally we use a shared DTO lib or duplicate the DTO class.
            // For quick prototype, we can map to a local DTO or use raw List<Map>.
            @SuppressWarnings("unchecked")
            List<java.util.Map<String, Object>> courseEnrollments = restTemplate.getForObject(
                    "http://course-service/api/courses/my/" + studentId, List.class);

            if (courseEnrollments != null) {
                List<Long> courseIds = courseEnrollments.stream()
                        .filter(e -> Boolean.TRUE.equals(e.get("approved"))) // Check if approved
                        .map(e -> ((Number) e.get("courseId")).longValue())
                        .collect(java.util.stream.Collectors.toList());

                if (!courseIds.isEmpty()) {
                    List<Exam> courseExams = examRepository.findByCourseIdIn(courseIds);
                    exams.addAll(courseExams);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch course enrollments: " + e.getMessage());
            // Fail gracefully, return what we have
        }

        // Remove duplicates if any
        return exams.stream().distinct().collect(java.util.stream.Collectors.toList());
    }

    public List<Exam> getExamsForCourses(List<Long> courseIds) {
        if (courseIds == null || courseIds.isEmpty()) {
            return List.of();
        }
        return examRepository.findByCourseIdIn(courseIds);
    }

    public Question addQuestion(QuestionDTO dto) {
        Exam exam = examRepository.findById(dto.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Question question = new Question();
        question.setText(dto.getText());
        question.setOptionA(dto.getOptionA());
        question.setOptionB(dto.getOptionB());
        question.setOptionC(dto.getOptionC());
        question.setOptionD(dto.getOptionD());
        question.setCorrectOption(dto.getCorrectOption());
        question.setMarks(dto.getMarks());
        question.setExam(exam);

        return questionRepository.save(question);
    }

    public List<Exam> getAllExams() {
        return examRepository.findByActiveTrue();
    }

    public List<Exam> getExamsByTeacher(Long teacherId) {
        return examRepository.findByTeacherId(teacherId);
    }

    public Exam getExamById(Long id) {
        Exam exam = examRepository.findById(id).orElseThrow(() -> new RuntimeException("Exam not found"));
        // Randomly shuffle questions for every fetch (Student view)
        // Note: For Teacher view in edit mode this might be annoying, but acceptable
        // for now
        java.util.Collections.shuffle(exam.getQuestions());
        return exam;
    }

    public void enrollStudent(Long examId, Long studentId) {
        if (!enrollmentRepository.existsByStudentIdAndExamId(studentId, examId)) {
            com.parikshasetu.examservice.model.Enrollment enrollment = new com.parikshasetu.examservice.model.Enrollment();
            enrollment.setExamId(examId);
            enrollment.setStudentId(studentId);
            enrollmentRepository.save(enrollment);
        }
    }
}
