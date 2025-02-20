const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL connection

// Endpoint to search films by title, actor, or genre
router.get('/search', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).send('Query is required');
  }

  try {
    const sql = `
      SELECT DISTINCT film.film_id, film.title, film.description
      FROM film
      LEFT JOIN film_actor ON film.film_id = film_actor.film_id
      LEFT JOIN actor ON film_actor.actor_id = actor.actor_id
      LEFT JOIN film_category ON film.film_id = film_category.film_id
      LEFT JOIN category ON film_category.category_id = category.category_id
      WHERE film.title LIKE ? OR actor.first_name LIKE ? OR actor.last_name LIKE ? OR category.name LIKE ?
    `;

    const [rows] = await db.execute(sql, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);

    if (rows.length > 0) {
      res.json(rows);  // Send the matching films as the response
    } else {
      res.status(404).send('No films found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Database query error');
  }
});

module.exports = router;
