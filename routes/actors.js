// backend/routes/actors.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL connection

// Endpoint to get top 5 actors
router.get('/top-actors', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM actor ORDER BY film_count DESC LIMIT 5');
    res.json(rows); // Respond with the top 5 actors
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
});

module.exports = router;
