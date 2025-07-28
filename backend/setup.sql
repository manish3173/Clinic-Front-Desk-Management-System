-- Database Setup for Clinic Management System

-- Create database
CREATE DATABASE IF NOT EXISTS clinic_management;
USE clinic_management;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(100) NOT NULL,
  role ENUM('admin', 'receptionist', 'doctor') DEFAULT 'receptionist',
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  location VARCHAR(255) NOT NULL,
  bio TEXT,
  isAvailable BOOLEAN DEFAULT TRUE,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  availableDays JSON NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(50) NOT NULL,
  lastName VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  dateOfBirth DATE NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  address TEXT NOT NULL,
  emergencyContact VARCHAR(20),
  medicalHistory TEXT,
  allergies TEXT,
  currentMedications TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patientId INT NOT NULL,
  doctorId INT NOT NULL,
  appointmentDate DATE NOT NULL,
  appointmentTime TIME NOT NULL,
  duration INT DEFAULT 30,
  type ENUM('consultation', 'follow_up', 'emergency', 'routine_checkup') DEFAULT 'consultation',
  status ENUM('booked', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'booked',
  reason TEXT,
  notes TEXT,
  isPriority BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Create queue table
CREATE TABLE IF NOT EXISTS queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patientId INT NOT NULL,
  doctorId INT,
  status ENUM('waiting', 'with_doctor', 'completed') DEFAULT 'waiting',
  priority INT DEFAULT 1,
  arrivalTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  startTime TIMESTAMP NULL,
  endTime TIMESTAMP NULL,
  notes TEXT,
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctorId) REFERENCES doctors(id) ON DELETE SET NULL
);

-- Insert admin user with hashed password for 'admin123'
-- Password hash for 'admin123' using bcrypt with salt rounds 10
INSERT IGNORE INTO users (username, password, fullName, role, isActive) 
VALUES ('admin', '$2b$10$8K1p/a0dUrACGCCF.ak0A.vUsX1zkU0OqYGKGJ8UYjF4W6HGAkfNW', 'System Administrator', 'admin', TRUE);

SELECT 'Database setup completed successfully!' as message;
SELECT 'Default login: admin / admin123' as credentials;
