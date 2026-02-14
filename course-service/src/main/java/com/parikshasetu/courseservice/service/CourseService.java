package com.parikshasetu.courseservice.service;

import com.parikshasetu.courseservice.model.Course;
import com.parikshasetu.courseservice.model.CourseEnrollment;
import com.parikshasetu.courseservice.repository.CourseEnrollmentRepository;
import com.parikshasetu.courseservice.repository.CourseRepository;
import com.parikshasetu.courseservice.repository.MaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final MaterialRepository materialRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    // Helper to add Bearer token
    private org.springframework.http.HttpHeaders getHeaders() {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        org.springframework.web.context.request.ServletRequestAttributes attributes = (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder
                .getRequestAttributes();
        if (attributes != null) {
            String authHeader = attributes.getRequest().getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                headers.set("Authorization", authHeader);
            }
        }
        return headers;
    }

    public CourseService(CourseRepository courseRepository, CourseEnrollmentRepository enrollmentRepository,
            MaterialRepository materialRepository, org.springframework.web.client.RestTemplate restTemplate) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.materialRepository = materialRepository;
        this.restTemplate = restTemplate;
    }

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByTeacher(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    public void enrollStudent(Long courseId, Long studentId) {
        if (courseId == null || studentId == null) {
            throw new IllegalArgumentException("Course ID and Student ID cannot be null");
        }
        try {
            if (enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId).isEmpty()) {
                CourseEnrollment enrollment = new CourseEnrollment();
                enrollment.setCourseId(courseId);
                enrollment.setStudentId(studentId);
                enrollment.setStatus(com.parikshasetu.courseservice.model.EnrollmentStatus.PENDING);
                enrollmentRepository.save(enrollment);
            }
        } catch (Exception e) {
            System.err.println("Error enrolling student: " + e.getMessage());
            throw new RuntimeException("Failed to enroll student: " + e.getMessage());
        }
    }

    public List<CourseEnrollment> getMyCourses(Long studentId) {
        // Return all enrollments so student sees PENDING and APPROVED
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<java.util.Map<String, Object>> getPendingEnrollments(Long courseId) {
        List<CourseEnrollment> enrollments = enrollmentRepository.findByCourseId(courseId).stream()
                .filter(e -> e.getStatus() == com.parikshasetu.courseservice.model.EnrollmentStatus.PENDING)
                .collect(Collectors.toList());
        return enrichEnrollments(enrollments);
    }

    public List<java.util.Map<String, Object>> getApprovedEnrollments(Long courseId) {
        List<CourseEnrollment> enrollments = enrollmentRepository.findByCourseId(courseId).stream()
                .filter(e -> e.getStatus() == com.parikshasetu.courseservice.model.EnrollmentStatus.APPROVED)
                .collect(Collectors.toList());
        return enrichEnrollments(enrollments);
    }

    private List<java.util.Map<String, Object>> enrichEnrollments(List<CourseEnrollment> enrollments) {
        if (enrollments.isEmpty()) {
            return new java.util.ArrayList<>();
        }

        List<Long> studentIds = enrollments.stream()
                .map(CourseEnrollment::getStudentId)
                .distinct()
                .collect(Collectors.toList());

        java.util.Map<Long, java.util.Map> userMap = new java.util.HashMap<>();
        try {
            String userServiceUrl = "http://user-service/api/users/batch";
            org.springframework.http.ResponseEntity<List> response = restTemplate.postForEntity(userServiceUrl,
                    studentIds, List.class);
            if (response.getBody() != null) {
                for (Object obj : response.getBody()) {
                    java.util.Map user = (java.util.Map) obj;
                    userMap.put(Long.valueOf(user.get("id").toString()), user);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch users: " + e.getMessage());
        }

        List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();
        for (CourseEnrollment e : enrollments) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", e.getId());
            map.put("courseId", e.getCourseId());
            map.put("studentId", e.getStudentId());
            map.put("status", e.getStatus());
            map.put("enrolledAt", e.getEnrolledAt());

            java.util.Map user = userMap.get(e.getStudentId());
            if (user != null) {
                map.put("studentName", user.get("fullName"));
                map.put("studentEmail", user.get("email"));
            } else {
                map.put("studentName", "Unknown ID: " + e.getStudentId());
                map.put("studentEmail", "N/A");
            }
            result.add(map);
        }
        return result;
    }

    public void approveEnrollment(Long enrollmentId) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId).orElseThrow();
        enrollment.setStatus(com.parikshasetu.courseservice.model.EnrollmentStatus.APPROVED);
        enrollmentRepository.save(enrollment);

        // Send Notification
        try {
            Course course = courseRepository.findById(enrollment.getCourseId()).orElse(new Course());
            java.util.Map<String, Object> notification = new java.util.HashMap<>();
            notification.put("userId", enrollment.getStudentId());
            notification.put("message",
                    "Enrollment approved for course: " + (course.getTitle() != null ? course.getTitle() : "Course"));
            restTemplate.postForLocation("http://notification-service/notifications", notification);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    public void deleteCourse(Long courseId) {
        courseRepository.deleteById(courseId);
    }

    public void removeStudent(Long courseId, Long studentId) {
        CourseEnrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        enrollmentRepository.delete(enrollment);
    }

    public void rejectEnrollment(Long enrollmentId) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId).orElseThrow();
        enrollment.setStatus(com.parikshasetu.courseservice.model.EnrollmentStatus.REJECTED);
        enrollmentRepository.save(enrollment);
    }

    public java.util.Map<String, Object> bulkEnroll(Long courseId,
            org.springframework.web.multipart.MultipartFile file) {
        System.out.println("CourseService: bulkEnroll called for course " + courseId);
        int createdUsers = 0;
        int existingUsers = 0;
        int enrolledStudents = 0;
        List<String> errorLog = new java.util.ArrayList<>();

        try (org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook(
                file.getInputStream())) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getLastRowNum();
            errorLog.add("Processing sheet with " + totalRows + " rows (excluding header potential)");

            for (org.apache.poi.ss.usermodel.Row row : sheet) {
                if (row.getRowNum() == 0)
                    continue; // Skip header

                org.apache.poi.ss.usermodel.Cell nameCell = row.getCell(0);
                org.apache.poi.ss.usermodel.Cell emailCell = row.getCell(1);

                if (emailCell != null) {
                    String email = emailCell.getStringCellValue().trim();
                    String fullName = (nameCell != null) ? nameCell.getStringCellValue().trim() : "Student";

                    if (!email.isEmpty()) {
                        try {
                            Long studentId = null;
                            boolean isNewUser = false;

                            // 1. Try LoadBalanced URL
                            String userServiceUrl = "http://user-service/api/users/search/email?email=" + email;
                            try {
                                org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(
                                        getHeaders());
                                org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate
                                        .exchange(userServiceUrl, org.springframework.http.HttpMethod.GET, entity,
                                                java.util.Map.class);

                                if (response.getBody() != null && response.getBody().containsKey("id")) {
                                    studentId = Long.valueOf(response.getBody().get("id").toString());
                                    existingUsers++;
                                }
                            } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
                                // User not found, proceed to registration
                            } catch (Exception e) {
                                errorLog.add("Lookup error for " + email + ": " + e.getMessage());
                            }

                            if (studentId == null) {
                                // Register User
                                String registerUrl = "http://user-service/api/auth/register";
                                java.util.Map<String, Object> registerRequest = new java.util.HashMap<>();
                                registerRequest.put("fullName", fullName.isEmpty() ? "Student" : fullName);
                                registerRequest.put("email", email);
                                registerRequest.put("password", "123456");
                                registerRequest.put("role", "STUDENT");

                                org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(
                                        registerRequest, getHeaders());

                                try {
                                    org.springframework.http.ResponseEntity<java.util.Map> registerResponse = restTemplate
                                            .postForEntity(registerUrl, entity, java.util.Map.class);
                                    if (registerResponse.getBody() != null
                                            && registerResponse.getBody().containsKey("id")) {
                                        studentId = Long.valueOf(registerResponse.getBody().get("id").toString());
                                        createdUsers++;
                                        isNewUser = true;
                                    }
                                } catch (Exception regEx) {
                                    errorLog.add("Register failed for " + email + ": " + regEx.getMessage());
                                }
                            }

                            // ENROLLMENT STEP - Always run if studentId exists
                            if (studentId != null) {
                                if (enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId).isEmpty()) {
                                    CourseEnrollment enrollment = new CourseEnrollment();
                                    enrollment.setCourseId(courseId);
                                    enrollment.setStudentId(studentId);
                                    enrollment
                                            .setStatus(com.parikshasetu.courseservice.model.EnrollmentStatus.APPROVED);
                                    enrollment.setApproved(true);
                                    enrollmentRepository.save(enrollment);
                                    enrolledStudents++;
                                } else {
                                    errorLog.add("Student " + email + " already enrolled.");
                                }
                            } else {
                                errorLog.add("Could not find or create user for " + email);
                            }
                        } catch (Exception e) {
                            errorLog.add("Error processing " + email + ": " + e.getMessage());
                        }
                    } else {
                        errorLog.add("Row " + row.getRowNum() + " has empty email.");
                    }
                }
            }
        } catch (Exception e) {
            errorLog.add("Fatal Excel Error: " + e.getMessage());
            // throw new RuntimeException("Failed to process Excel file: " +
            // e.getMessage());
            // Don't throw, return the log so user can see it
        }

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("created", createdUsers);
        stats.put("existing", existingUsers);
        stats.put("enrolled", enrolledStudents);
        stats.put("errors", errorLog);
        return stats;
    }

    public java.io.ByteArrayInputStream generateStudentTemplate() {
        try (org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Students");

            // Header Row
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Student Full Name");
            headerRow.createCell(1).setCellValue("Student Email");

            // Sample Row
            org.apache.poi.ss.usermodel.Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("John Doe");
            sampleRow.createCell(1).setCellValue("student@example.com");

            workbook.write(out);
            return new java.io.ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate template: " + e.getMessage());
        }
    }

    public List<Long> getEnrolledStudentIdsForTeacher(Long teacherId) {
        List<Course> teacherCourses = courseRepository.findByTeacherId(teacherId);
        return teacherCourses.stream()
                .flatMap(course -> enrollmentRepository.findByCourseId(course.getId()).stream())
                .filter(e -> e.getStatus() == com.parikshasetu.courseservice.model.EnrollmentStatus.APPROVED)
                .map(CourseEnrollment::getStudentId)
                .distinct()
                .collect(Collectors.toList());
    }

    public Long countMaterialsByTeacher(Long teacherId) {
        List<Course> courses = courseRepository.findByTeacherId(teacherId);
        if (courses.isEmpty()) {
            return 0L;
        }
        List<Long> courseIds = courses.stream().map(Course::getId).collect(Collectors.toList());
        return materialRepository.countByCourseIdIn(courseIds);
    }

    public List<java.util.Map<String, Object>> getStudentsByTeacher(Long teacherId) {
        // 1. Get all student IDs enrolled in teacher's courses
        List<Long> studentIds = getEnrolledStudentIdsForTeacher(teacherId);

        if (studentIds.isEmpty()) {
            return new java.util.ArrayList<>();
        }

        // 2. Fetch student details from User Service
        try {
            // Using existing batch endpoint in user-service
            String userServiceUrl = "http://user-service/api/users/batch";
            org.springframework.http.ResponseEntity<List> response = restTemplate
                    .postForEntity(userServiceUrl, studentIds, List.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("Failed to fetch students from user-service: " + e.getMessage());
            return new java.util.ArrayList<>();
        }
    }
}
