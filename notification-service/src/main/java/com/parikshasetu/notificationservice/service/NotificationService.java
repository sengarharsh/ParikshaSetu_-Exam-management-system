package com.parikshasetu.notificationservice.service;

import com.parikshasetu.notificationservice.model.Notification;
import com.parikshasetu.notificationservice.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository repository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository repository,
            org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
    }

    public void createNotification(Long userId, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        repository.save(n);

        // Push to WebSocket
        messagingTemplate.convertAndSendToUser(
                String.valueOf(userId),
                "/queue/notifications",
                n);

        System.out.println("Notification created and pushed for user " + userId + ": " + message);
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
