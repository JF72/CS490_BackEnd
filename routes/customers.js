const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL connection

// Endpoint to get all customers
router.get('/', async (req, res) => {
  try {
    // Use db.query() instead of db.execute()
    const [rows, fields] = await db.query('SELECT * FROM customer');
    
    // Log the rows to check the result
    console.log('Fetched customer data:', rows);

    if (rows && rows.length > 0) {
      res.json(rows);  // Send customer data if rows exist
    } else {
      throw new Error('No rows found');  // Handle case where no data is returned
    }

  } catch (error) {
    console.error('Database query error:', error);  // Log the error for debugging
    res.status(500).send("Database error");
  }
});

module.exports = router;
