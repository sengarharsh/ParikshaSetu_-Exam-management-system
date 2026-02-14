-- Execute this script as root in MySQL Workbench or CLI

CREATE DATABASE IF NOT EXISTS parikshasetu_user;
CREATE DATABASE IF NOT EXISTS parikshasetu_exam;
CREATE DATABASE IF NOT EXISTS parikshasetu_submission;
CREATE DATABASE IF NOT EXISTS parikshasetu_result;

-- Optional: Create a user if you want to use specific credentials instead of root
-- CREATE USER 'pariksha_user'@'localhost' IDENTIFIED BY 'password';
-- GRANT ALL PRIVILEGES ON *.* TO 'pariksha_user'@'localhost';
-- FLUSH PRIVILEGES;
