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

router.get('/top-rented', async(req, res) =>{
  try{
    const sql = `
      SELECT film.film_id, film.title, film.description, COUNT(rental.rental_id) AS rental_count
      FROM film
      JOIN inventory ON film.film_id = inventory.film_id
      JOIN rental ON inventory.inventory_id = rental.inventory_id
      GROUP BY film.film_id
      ORDER BY rental_count DESC
      LIMIT 5
    `;
    const [rows] = await db.execute(sql);
    res.json(rows);
  } catch (error){
    console.error(error);
    res.status(500).send("Database Query Error");
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Fetching film with id:', id);
  try {
    const query = `
      SELECT f.*, GROUP_CONCAT(c.name) AS genres
      FROM film f
      LEFT JOIN film_category fc ON f.film_id = fc.film_id
      LEFT JOIN category c ON fc.category_id = c.category_id
      WHERE f.film_id = ?
      GROUP BY f.film_id
    `;
    const [rows] = await db.query(query, [id]);
    console.log('Rows returned:', rows.length);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Film not found');
    }
  } catch (error) {
    console.error('Error fetching film details:', error);
    res.status(500).send('Database error');
  }
});


module.exports = router;
