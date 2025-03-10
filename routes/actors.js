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

router.get('/top-actors/:storeId', async (req, res) => {
  const { storeId } = req.params;
  try {
    const sql = `
      SELECT 
        a.actor_id,
        a.first_name,
        a.last_name,
        COUNT(DISTINCT i.film_id) AS film_count
      FROM actor a
      JOIN film_actor fa ON a.actor_id = fa.actor_id
      JOIN inventory i ON fa.film_id = i.film_id
      WHERE i.store_id = ?
      GROUP BY a.actor_id, a.first_name, a.last_name
      ORDER BY film_count DESC
      LIMIT 5
    `;
    const [rows] = await db.execute(sql, [storeId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database query error");
  }
});

// GET actor details by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM actor WHERE actor_id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Actor not found');
    }
  } catch (error) {
    console.error('Error fetching actor details:', error);
    res.status(500).send('Database error');
  }
});

// GET top 5 rented films for a given actor
router.get('/:id/top-films', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT f.film_id, f.title, f.description, COUNT(r.rental_id) AS rental_count
      FROM film f
      JOIN film_actor fa ON f.film_id = fa.film_id
      JOIN inventory i ON f.film_id = i.film_id
      JOIN rental r ON i.inventory_id = r.inventory_id
      WHERE fa.actor_id = ?
      GROUP BY f.film_id, f.title, f.description
      ORDER BY rental_count DESC
      LIMIT 5
    `;
    const [rows] = await db.execute(sql, [id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching top films for actor:', error);
    res.status(500).send("Database query error");
  }
});

module.exports = router;
