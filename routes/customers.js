const express = require('express');
const router = express.Router();
const db = require('../db'); // MySQL connection

// Endpoint to get all customers with search functionality
router.get('/', async (req, res) => {
  const { customer_id, first_name, last_name } = req.query;  // Get search filters from query params

  // Construct the query based on provided filters
  let query = 'SELECT * FROM customer WHERE 1=1';
  const queryParams = [];

  if (customer_id) {
    query += ' AND customer_id = ?';
    queryParams.push(customer_id);
  }
  if (first_name) {
    query += ' AND first_name LIKE ?';
    queryParams.push(`%${first_name}%`);
  }
  if (last_name) {
    query += ' AND last_name LIKE ?';
    queryParams.push(`%${last_name}%`);
  }

  try {
    const [rows] = await db.query(query, queryParams);
    res.json(rows);  // Return the filtered list of customers
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send('Database error');
  }
});

// Endpoint to get customer details by customer_id
router.get('/:id', async (req, res) => {
  const { id } = req.params;  // Get customer ID from URL parameters

  try {
    const [rows] = await db.query('SELECT * FROM customer WHERE customer_id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);  // Return the first customer from the result
    } else {
      res.status(404).send('Customer not found');
    }
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).send('Database error');
  }
});

// Endpoint to add a new customer
router.post('/', async (req, res) => {
  const { first_name, last_name, email, store_id, address_id } = req.body;

  if (!first_name || !last_name || !email || !store_id || !address_id) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const result = await db.query(
      'INSERT INTO customer (first_name, last_name, email, store_id, address_id) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, store_id, address_id]
    );

    res.status(201).json({ message: 'Customer added successfully', customer_id: result.insertId });
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).send('Database error');
  }
});

// Endpoint to update customer details
router.put('/:id', async (req, res) => {
  const { id } = req.params;  // Get customer ID from URL parameters
  const { first_name, last_name, email, store_id, address_id } = req.body;  // Get new data from request body

  if (!first_name || !last_name || !email || !store_id || !address_id) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const updateQuery = `
      UPDATE customer
      SET first_name = ?, last_name = ?, email = ?, store_id = ?, address_id = ?
      WHERE customer_id = ?
    `;
    const [result] = await db.query(updateQuery, [
      first_name,
      last_name,
      email,
      store_id,
      address_id,
      id,
    ]);

    if (result.affectedRows > 0) {
      res.json({ message: 'Customer details updated successfully' });
    } else {
      res.status(404).send('Customer not found');
    }
  } catch (error) {
    console.error('Error updating customer details:', error);
    res.status(500).send('Database error');
  }
});

// Endpoint to delete a customer
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // First, delete the related rental records
    await db.query('DELETE FROM rental WHERE customer_id = ?', [id]);

    // Then, delete the related payment records (if applicable)
    await db.query('DELETE FROM payment WHERE customer_id = ?', [id]);

    // Finally, delete the customer
    const [result] = await db.query('DELETE FROM customer WHERE customer_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send('Customer not found');
    }

    res.json({ message: "Customer deleted" });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).send("Error deleting customer");
  }
});

router.get('/:id/rentals', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT r.*, f.title, f.description,
             IF(r.return_date IS NULL, 'Current', 'Past') AS rental_status
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      WHERE r.customer_id = ?
      ORDER BY r.rental_date DESC
    `;
    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching rental history:', error);
    res.status(500).send('Database error');
  }
});


module.exports = router;
