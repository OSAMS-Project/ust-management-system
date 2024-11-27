const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const Asset = require('../models/assets');
const { executeTransaction } = require('../utils/queryExecutor');
const pool = require('../config/database');

// SSE endpoint
router.get('/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  req.app.get('sse').init(req, res);
});

router.post('/create', assetController.createAsset);
router.get('/read', assetController.readAssets);
router.put('/update/:id', assetController.updateAsset);
router.delete('/delete/:id', assetController.deleteAsset);
router.put('/:id/active', assetController.updateAssetActiveStatus);
router.get('/active/count', assetController.getTotalActiveAssets);
router.get('/available/count', assetController.getTotalAvailableAssets);
router.get('/sorted', assetController.getAssetsSortedByActiveStatus);
router.get('/active', assetController.getActiveAssets);
router.put('/:id/status', assetController.updateAssetStatus);
router.put('/:id/issue-status', assetController.updateAssetIssueStatus);
router.put('/:id/repair-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { under_repair } = req.body;
    
    console.log('Updating repair status for asset:', id, 'to:', under_repair);
    
    const [result] = await Asset.updateRepairStatus(id, under_repair);
    
    if (result) {
      console.log('Asset repair status updated:', result);
      res.json(result);
    } else {
      console.log('Asset not found:', id);
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (error) {
    console.error('Error updating repair status:', error);
    res.status(500).json({ 
      message: 'Error updating repair status',
      error: error.message,
      details: {
        assetId: req.params.id,
        requestedStatus: req.body.under_repair
      }
    });
  }
});

router.put('/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    console.log('Updating asset:', { id, quantity }); // Debug log

    // First, get the current asset to verify it exists
    const getAssetQuery = {
      text: 'SELECT * FROM assets WHERE asset_id = $1',
      values: [id]
    };

    const asset = await pool.query(getAssetQuery);
    
    if (asset.rows.length === 0) {
      return res.status(404).json({
        message: `Asset with ID ${id} not found`
      });
    }

    // Update asset quantity
    const updateQuery = {
      text: `
        UPDATE assets 
        SET quantity_for_borrowing = quantity_for_borrowing + $1
        WHERE asset_id = $2 
        RETURNING *
      `,
      values: [quantity, id]
    };

    const result = await pool.query(updateQuery);

    if (result.rows.length === 0) {
      throw new Error('Update failed');
    }

    res.json({
      message: 'Asset quantity updated successfully',
      asset: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating asset quantity:', error);
    res.status(500).json({
      message: 'Error updating asset quantity',
      error: error.message
    });
  }
});

router.put('/updateQuantity/:assetId', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { assetId } = req.params;
    const { quantity } = req.body;

    console.log('Received update request:', { assetId, quantity });

    // Validate quantity
    if (quantity === undefined || quantity === null) {
      throw new Error('Quantity is required');
    }

    const validQuantity = parseInt(quantity);
    if (isNaN(validQuantity)) {
      throw new Error('Invalid quantity value');
    }

    const query = `
      UPDATE assets 
      SET quantity = $1,
          "lastUpdated" = CURRENT_TIMESTAMP 
      WHERE asset_id = $2 
      RETURNING *
    `;

    const result = await client.query(query, [validQuantity, assetId]);

    if (result.rows.length === 0) {
      throw new Error('Asset not found');
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Asset quantity updated successfully',
      asset: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating asset quantity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await Asset.readAsset(id);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    res.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch asset'
    });
  }
});

router.get('/check-product-code/:productCode', assetController.checkProductCode);
router.get('/borrowing/total', assetController.getTotalBorrowingQuantity);
router.get('/check-serial-number/:serialNumber', assetController.checkSerialNumber);

module.exports = router;
