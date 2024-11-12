const express = require('express');
const pool = require('../db');

const router = express.Router();

// Add or modify the POST endpoint
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { asset_id, issue_quantity, ...issueData } = req.body;
    
    await connection.beginTransaction();

    // First get the current asset details
    const [assetResult] = await connection.query(
      'SELECT * FROM assets WHERE asset_id = $1',
      [asset_id]
    );

    if (!assetResult || assetResult.quantity < issue_quantity) {
      await connection.rollback();
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    // Calculate new quantity
    const newQuantity = parseInt(assetResult.quantity) - parseInt(issue_quantity);

    // Update asset quantity and status
    const updateAssetQuery = `
      UPDATE assets 
      SET 
        quantity = $1,
        has_issue = true
      WHERE asset_id = $2
    `;
    
    await connection.query(updateAssetQuery, [newQuantity, asset_id]);

    // Create issue record
    const insertIssueQuery = `
      INSERT INTO asset_issues 
      (asset_id, issue_type, description, priority, issue_quantity, reported_by, user_picture, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending') 
      RETURNING *
    `;

    const [issueResult] = await connection.query(
      insertIssueQuery,
      [
        asset_id,
        issueData.issue_type,
        issueData.description,
        issueData.priority,
        parseInt(issue_quantity),
        issueData.reported_by,
        issueData.user_picture
      ]
    );

    await connection.commit();
    
    res.status(201).json({
      ...issueResult,
      asset: assetResult
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating issue:', error);
    res.status(500).json({ 
      message: 'Error creating issue', 
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Add or modify the DELETE endpoint
router.delete('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // First get the issue details to know the quantity to restore
      const [issue] = await connection.query(
        'SELECT asset_id, quantity FROM asset_issues WHERE id = ?',
        [req.params.id]
      );

      if (issue.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Issue not found' });
      }

      // Restore the quantity to the asset
      await connection.query(
        'UPDATE assets SET quantity = quantity + ? WHERE asset_id = ?',
        [issue[0].quantity, issue[0].asset_id]
      );

      // Delete the issue
      await connection.query('DELETE FROM asset_issues WHERE id = ?', [req.params.id]);

      await connection.commit();
      res.status(200).json({ message: 'Issue deleted successfully' });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ message: 'Error deleting issue', error: error.message });
  }
});

module.exports = router; 