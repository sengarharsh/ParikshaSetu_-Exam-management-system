# ParikshaSetu - Online Exam Management System

> **ParikshaSetu** is a modern, containerized, microservices-based platform designed to streamline the entire examination process. It seamlessly connects Teachers, Students, and Administrators, providing a robust environment for exam creation, participation, and result analysis.

---

## 🚀 Key Features

### 🎓 For Students
- **Interactive Dashboard**: View enrolled courses, upcoming exams, and recent results at a glance.
- **Secure Exam Environment**: Timed exams with auto-submission and secure result processing.
- **Resource Access**: Download course materials (PDFs, PPTs) directly from the portal.
- **Performance Analytics**: Detailed report cards and leaderboard rankings.

### 👩‍🏫 For Teachers
- **Course Management**: Create courses, approve student enrollments, and upload study materials.
- **Exam Builder**: Flexible exam creation with support for various question types.
- **Student Monitoring**: Track student progress and view detailed result analytics.
- **Bulk Operations**: enroll students in bulk via Excel upload.

### 🛡️ For Administrators
- **User Management**: Verify teacher accounts and manage student access.
- **System Oversight**: Monitor all active courses and exams across the platform.

---

## 🏗️ Architecture & Technology Stack

The application is built using a **Microservices Architecture**, fully containerized for easy deployment.

### **Backend (Spring Boot)**
| Service | Port | Description |
| :--- | :--- | :--- |
| **Discovery Service** | `8761` | Eureka Server for service registration and discovery. |
| **API Gateway** | `8080` | Central entry point handling routing and load balancing. |
| **User Service** | `8081` | Authentication (JWT) and user profile management. |
| **Exam Service** | `8082` | Manages exams, questions, and scheduling. |
| **Result Service** | `8084` | Processes exam submissions and generates results. |
| **Notification Service** | `8085` | Handles email notifications and alerts. |
| **Course Service** | `8086` | Manages courses, enrollments, and study materials. |

### **Frontend (React)**
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS for a modern, responsive UI.
- **State Management**: Context API.
- **Routing**: React Router DOM.
- **Server**: Nginx (in Docker production build).

### **Database & DevOps**
- **Database**: MySQL 8.0 (Containerized).
- **Containerization**: Docker & Docker Compose.
- **Build Tool**: Maven (Backend), NPM (Frontend).

---

## 🏃‍♂️ Getting Started (Docker)

This is the **recommended** way to run the application. It brings up the entire stack (Database, Backend Services, Frontend) with a single command.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- Git.

### 1. Clone the Repository
```bash
git clone https://github.com/sengarharsh/ParikshaSetu_-Exam-management-system.git
cd ParikshaSetu_-Exam-management-system
```

### 2. Run the Application
```bash
docker-compose up --build -d
```
*This command may take a few minutes the first time as it builds all Docker images, downloads dependencies, and initializes the database.*

### 3. Access the Application
Once all containers are healthy:
- **Frontend App**: [http://localhost](http://localhost)
- **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761) (Check service status here)
- **API Gateway**: [http://localhost:8080](http://localhost:8080)

### 4. Stop the Application
```bash
docker-compose down
```

---

## 🛠️ Configuration & Troubleshooting

### Database Access
The MySQL container is mapped to host port **3307** to prevent conflicts with local MySQL installations.
- **Host**: `localhost`
- **Port**: `3307`
- **Username**: `root`
- **Password**: `root123`
- **Database Name**: `parikshasetu_user` (and others per service)

### Common Issues
1.  **Service Registration**: If `notification-service` or others don't appear in Eureka immediately, wait 30-60 seconds for them to complete startup and registration.
2.  **Login Errors**: If you get a "User not found" error, ensure you have registered a new account. The database is fresh on every first Docker run (unless volumes are persisted).
3.  **Port Conflicts**: Ensure ports `80`, `8080`, `3307`, and `8761` are free on your host machine.

---

## 📜 License
This project is developed for educational purposes.

---
**Developed by Harsh Sengar**