// backend/routes/rentals.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL connection

// Endpoint to rent a film to a customer
router.post('/', async (req, res) => {
  const { customer_id, inventory_id, staff_id, rental_date } = req.body;

  // Validate required fields
  if (!customer_id || !inventory_id || !staff_id) {
    return res.status(400).send('Missing required fields: customer_id, inventory_id, and staff_id');
  }

  try {
    // Check if the inventory item is already rented (i.e. there is an active rental with a NULL return_date)
    const [activeRentals] = await db.query(
      'SELECT * FROM rental WHERE inventory_id = ? AND return_date IS NULL',
      [inventory_id]
    );

    if (activeRentals.length > 0) {
      // If there is an active rental, return an error
      return res.status(400).json({ message: 'This film is already rented out' });
    }

    // If available, insert the new rental record
    const rentalDate = rental_date || new Date();
    const [result] = await db.query(
      'INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id) VALUES (?, ?, ?, ?)',
      [rentalDate, inventory_id, customer_id, staff_id]
    );

    res.status(201).json({ message: 'Film rented successfully', rental_id: result.insertId });
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).send('Database error');
  }
});

// Endpoint to mark a rental as returned
router.put('/:rentalId/return', async (req, res) => {
  const { rentalId } = req.params;

  try {
    // Update the rental: set return_date to NOW() if it's currently NULL
    const [result] = await db.query(
      `UPDATE rental
       SET return_date = NOW()
       WHERE rental_id = ?
         AND return_date IS NULL`,
      [rentalId]
    );

    if (result.affectedRows > 0) {
      res.json({ message: 'Rental marked as returned' });
    } else {
      // Either the rental doesn't exist or it's already returned
      res.status(404).json({ message: 'Rental not found or already returned' });
    }
  } catch (error) {
    console.error('Error marking rental as returned:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
