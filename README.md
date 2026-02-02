# ParikshaSetu - Online Examination System

## Project Overview
A complete Microservices-based Examination System including:
- **Eureka Server**: Service Registry (Port 8761)
- **API Gateway**: Routing (Port 8080)
- **User Service**: Auth & Users (Port 8081)
- **Exam Service**: Exam Management (Port 8082)
- **Submission Service**: Exam Submission & Logs (Port 8083)
- **Result Service**: Grading & Reports (Port 8084)
- **Notification Service**: Email Stub (Port 8085)
- **Frontend**: React-based UI (Port 5173 - default)

## Prerequisites
- Java 17+
- Maven
- MySQL (Running on localhost:3306)
- MongoDB (Running on localhost:27017)
- Node.js & npm

## Setup Instructions

### 1. Database Setup
1. Open MySQL Workbench or CLI.
2. Run the script `db_setup.sql` located in the root directory.
   ```sql
   source db_setup.sql;
   ```
   *Note: Ensure your MySQL root password is `root123`. If not, update `application.properties` in each service.*

### 2. Start Services (Order Matters)
Open separate terminals for each service and run:

1. **Eureka Server**
   ```bash
   cd eureka-server
   mvn spring-boot:run
   ```
   *Wait for it to start fully.*

2. **User Service**
   ```bash
   cd user-service
   mvn spring-boot:run
   ```

3. **API Gateway**
   ```bash
   cd api-gateway
   mvn spring-boot:run
   ```

4. **Other Services** (Exam, Submission, Result, Notification)
   ```bash
   cd exam-service
   mvn spring-boot:run
   ```
   *(Repeat for submission-service, result-service, notification-service)*

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing
- **Frontend**: Open `http://localhost:5173`.
- **API Gateway**: `http://localhost:8080`.
- **Eureka Dashboard**: `http://localhost:8761`.

## Default Credentials
- Register a new user via Frontend or Postman (`POST /auth/register`).
- Login to access the dashboard.

teacher token : eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZWFjaGVyQGV4YW1wbGUuY29tIiwicm9sZSI6IlRFQUNIRVIiLCJpYXQiOjE3MzgzNTAwNzksImV4cCI6MTczODM1MzY3OX0.425lXy_86o1R5q7Q29z47891_1678901234

student token : eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50QGV4YW1wbGUuY29tIiwicm9sZSI6IlNUTURFTlQiLCJpYXQiOjE3MzgzNTAwNzksImV4cCI6MTczODM1MzY3OX0.425lXy_86o1R5q7Q29z47891_1678901234