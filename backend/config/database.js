const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'roadfund_system',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  multipleStatements: false,
});

// Test connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully via XAMPP');
    connection.release();
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    console.error('   Make sure XAMPP MySQL is running on port', process.env.DB_PORT || 3306);
    process.exit(1);
  }
};

testConnection();

module.exports = pool;
