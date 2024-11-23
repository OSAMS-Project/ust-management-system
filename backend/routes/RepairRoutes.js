const express = require('express');
const router = express.Router();
const RepairController = require('../controllers/RepairController');

// Get all repair records
router.get('/read', RepairController.getAllRepairRecords);

// Create repair record
router.post('/create', RepairController.createRepairRecord);

// Complete repair record
router.put('/:id/complete', RepairController.completeRepairRecord);

// Cancel repair record
router.put('/:id/cancel', RepairController.cancelRepairRecord);

// Delete repair record
router.delete('/:id', RepairController.deleteRepairRecord);

// Get repair records by asset
router.get('/asset/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    if (!assetId) {
      return res.status(400).json({ message: 'Asset ID is required' });
    }

    const records = await RepairController.getRepairRecordsByAsset(assetId);
    res.json(records);
  } catch (error) {
    console.error('Error fetching repair records:', error);
    res.status(500).json({ message: 'Error fetching repair records' });
  }
});

module.exports = router;
