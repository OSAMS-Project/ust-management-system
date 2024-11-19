const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const Repair = require('../models/Repair');

router.post('/create', async (req, res) => {
  try {
    const {
      asset_id,
      repair_type,
      description,
      date,
      cost,
      performed_by,
      quantity,
      issue_id
    } = req.body;

    console.log('Received repair data:', req.body); // Debug log

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create the repair record
      const [result] = await connection.query(
        `INSERT INTO repair_records (
          asset_id, repair_type, description, date, 
          cost, performed_by, status, quantity, issue_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          asset_id,
          repair_type,
          description,
          date || new Date(),
          parseFloat(cost) || 0,
          performed_by,
          'In Progress',
          parseInt(quantity) || 1,
          issue_id ? parseInt(issue_id) : null
        ]
      );

      // Get the newly created repair record with asset details
      const [newRepair] = await connection.query(
        `SELECT r.*, a.assetName 
         FROM repair_records r 
         JOIN assets a ON r.asset_id = a.asset_id 
         WHERE r.id = $1`,
        [result.id]
      );

      await connection.commit();
      res.status(201).json(newRepair[0]);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creating repair record:', error);
    res.status(500).json({ 
      message: 'Error creating repair record', 
      error: error.message,
      data: req.body // Include the received data in error response
    });
  }
});

router.put('/:id/complete', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const id = req.params.id;
    await connection.beginTransaction();

    // Get repair record details
    const [repair] = await connection.query(
      'SELECT * FROM repair_records WHERE id = $1',
      [id]
    );

    if (!repair) {
      await connection.rollback();
      return res.status(404).json({ message: 'Repair record not found' });
    }

    // Update repair status
    await connection.query(
      'UPDATE repair_records SET status = $1, completion_date = CURRENT_TIMESTAMP WHERE id = $2',
      ['Completed', id]
    );

    // Restore the quantity to the asset
    await connection.query(
      'UPDATE assets SET quantity = quantity + $1, under_repair = false WHERE asset_id = $2',
      [repair.quantity, repair.asset_id]
    );

    // Update issue status if exists
    if (repair.issue_id) {
      await connection.query(
        'UPDATE asset_issues SET status = $1 WHERE id = $2',
        ['Resolved', repair.issue_id]
      );
    }

    await connection.commit();
    res.json({ message: 'Repair completed successfully', repair });

  } catch (error) {
    await connection.rollback();
    console.error('Error completing repair:', error);
    res.status(500).json({ message: 'Error completing repair', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/', async (req, res) => {
  try {
    const [repairs] = await pool.query(
      `SELECT r.*, a.assetName 
       FROM repair_records r 
       JOIN assets a ON r.asset_id = a.asset_id 
       ORDER BY r.date DESC`
    );
    
    res.json(repairs);
  } catch (error) {
    console.error('Error fetching repairs:', error);
    res.status(500).json({ message: 'Error fetching repairs', error: error.message });
  }
});

module.exports = router;