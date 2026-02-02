package com.parikshasetu.notificationservice.service;

import com.parikshasetu.notificationservice.model.Notification;
import com.parikshasetu.notificationservice.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public void createNotification(Long userId, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        repository.save(n);
        // Also send email if needed (can keep the mock logic)
        System.out.println("Notification created for user " + userId + ": " + message);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAsRead(Long id) {
        repository.findById(id).ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
    }

    public void sendEmail(String to, String subject, String body) {
        // Mock implementation
        System.out.println("------------------------------------------------");
        System.out.println("SENDING EMAIL TO: " + to);
        System.out.println("SUBJECT: " + subject);
        System.out.println("BODY: " + body);
        System.out.println("------------------------------------------------");
    }
}
