const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import route handlers
const filmsRoutes = require('./routes/films');  // Make sure this is correct
const actorsRoutes = require('./routes/actors');
const customersRoutes = require('./routes/customers');

const app = express();

app.use(express.json());  // Parses incoming JSON requests
app.use(cors());          // Enables CORS
app.use(bodyParser.json());  // Additional body parser setup

app.use('/api/films', filmsRoutes);  // Ensure this line is present
app.use('/api/actors', actorsRoutes);
app.use('/api/customers', customersRoutes);

// Database connection setup using mysql2
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'JF041104',
  database: 'sakila',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
  connection.release();  // Release connection back to pool
});

const PORT = 3008;  // Your backend port, make sure it's correct
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
