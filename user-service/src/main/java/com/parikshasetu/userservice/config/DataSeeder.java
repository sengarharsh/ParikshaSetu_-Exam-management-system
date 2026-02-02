package com.parikshasetu.userservice.config;

import com.parikshasetu.userservice.model.Role;
import com.parikshasetu.userservice.model.User;
import com.parikshasetu.userservice.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        createAdminIfNotFound();
        fixLegacyUsers();
    }

    private void createAdminIfNotFound() {
        Optional<User> adminOptional = userRepository.findByEmail("admin@example.com");
        if (adminOptional.isEmpty()) {
            User admin = new User();
            admin.setFullName("Super Admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setVerified(true);
            admin.setStatus(com.parikshasetu.userservice.model.Status.APPROVED);
            userRepository.save(admin);
            System.out.println("✅ Default Admin User Created: admin@example.com / admin123");
        } else {
            User admin = adminOptional.get();
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(com.parikshasetu.userservice.model.Status.APPROVED);
            userRepository.save(admin);
            System.out.println("✅ Admin User Verified/Updated: admin@example.com / admin123");
        }
    }

    private void fixLegacyUsers() {
        java.util.List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getStatus() == null) {
                user.setStatus(com.parikshasetu.userservice.model.Status.APPROVED);
                userRepository.save(user);
                System.out.println("⚠️ Fixed Legacy User Status: " + user.getEmail());
            }
        }
    }
}
