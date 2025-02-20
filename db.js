// backend/db.js
const mysql = require('mysql2/promise');

// Create a MySQL pool connection
const db = mysql.createPool({
  host: '127.0.0.1', // Your database host
  user: 'root',       // Your database username
  password: 'JF041104', // Your database password
  database: 'sakila', // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export the connection pool for use in routes
module.exports = db;
