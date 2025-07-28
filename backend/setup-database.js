const mysql = require('mysql2/promise');

async function setupDatabase() {
  try {
    // First connect without database to create it
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Manish@31'
    });

    console.log('Connected to MySQL server...');

    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS clinic_management');
    console.log('✅ Database "clinic_management" created/verified');

    await connection.end();

    // Now connect to the specific database
    const dbConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Manish@31',
      database: 'clinic_management'
    });

    // Create users table
    await dbConnection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fullName VARCHAR(100) NOT NULL,
        role ENUM('admin', 'receptionist', 'doctor') DEFAULT 'receptionist',
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created/verified');

    // Create doctors table
    await dbConnection.execute(`
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
      )
    `);
    console.log('✅ Doctors table created/verified');

    // Create patients table
    await dbConnection.execute(`
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
      )
    `);
    console.log('✅ Patients table created/verified');

    // Create appointments table
    await dbConnection.execute(`
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
      )
    `);
    console.log('✅ Appointments table created/verified');

    // Create queue table
    await dbConnection.execute(`
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
      )
    `);
    console.log('✅ Queue table created/verified');

    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('You can now run: node create-admin.js');

    await dbConnection.end();
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('');
      console.log('Access denied. Please check:');
      console.log('1. MySQL server is running');
      console.log('2. Username and password are correct');
      console.log('3. User has permission to create databases');
    }
  }
}

setupDatabase();
