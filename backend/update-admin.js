const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function updateAdminPassword() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Manish@31',
      database: 'clinic_management'
    });

    console.log('Connected to database...');

    // Generate new hash for admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Generated new password hash');

    // Update admin user password
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );

    if (result.affectedRows > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
      console.log('');
      console.log('You can now login at http://localhost:3000');
    } else {
      console.log('❌ Admin user not found. Creating new admin user...');
      
      await connection.execute(
        'INSERT INTO users (username, password, fullName, role, isActive) VALUES (?, ?, ?, ?, ?)',
        ['admin', hashedPassword, 'System Administrator', 'admin', true]
      );
      
      console.log('✅ Admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
    }

    // Verify the user exists
    const [users] = await connection.execute(
      'SELECT id, username, fullName, role FROM users WHERE username = ?',
      ['admin']
    );

    console.log('');
    console.log('Admin user details:', users[0]);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateAdminPassword();
