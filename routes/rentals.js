// backend/routes/rentals.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL connection

// Endpoint to rent a film to a customer
router.post('/', async (req, res) => {
  // Expecting: customer_id, inventory_id, staff_id, and optionally rental_date
  const { customer_id, inventory_id, staff_id, rental_date } = req.body;

  // Validate required fields
  if (!customer_id || !inventory_id || !staff_id) {
    return res.status(400).send('Missing required fields: customer_id, inventory_id, and staff_id');
  }

  // Use the provided rental_date or default to now
  const rentalDate = rental_date || new Date();

  try {
    const sql = `
      INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [rentalDate, inventory_id, customer_id, staff_id]);
    res.status(201).json({ message: 'Film rented successfully', rental_id: result.insertId });
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).send('Database error');
  }
});

router.put('/:rentalId/return', async (req, res) => {
    const { rentalId } = req.params;
    try {
      // Update the rental: set return_date to NOW() if it is currently null.
      const sql = `
        UPDATE rental
        SET return_date = NOW()
        WHERE rental_id = ? AND return_date IS NULL
      `;
      const [result] = await db.execute(sql, [rentalId]);
      if (result.affectedRows > 0) {
        res.json({ message: 'Rental marked as returned' });
      } else {
        res.status(404).send('Rental not found or already returned');
      }
    } catch (error) {
      console.error('Error marking rental as returned:', error);
      res.status(500).send('Database error');
    }
  });
module.exports = router;
