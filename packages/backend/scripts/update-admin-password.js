/**
 * Script untuk update password admin
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function updateAdminPassword() {
  try {
    // Generate hash untuk password 'admin123'
    const password = 'admin123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('Generated hash for admin123:', hashedPassword);
    
    // Koneksi ke database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'arkan',
      password: 'Arkan123!@#',
      database: 'kasir'
    });
    
    // Update password admin
    const [result] = await connection.execute(
      'UPDATE pengguna SET password_hash = ? WHERE username = ?',
      [hashedPassword, 'admin']
    );
    
    console.log('Password updated successfully:', result.affectedRows, 'rows affected');
    
    // Verify the update
    const [rows] = await connection.execute(
      'SELECT username, password_hash FROM pengguna WHERE username = ?',
      ['admin']
    );
    
    console.log('Updated admin user:', rows[0]);
    
    await connection.end();
    
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
}

updateAdminPassword();