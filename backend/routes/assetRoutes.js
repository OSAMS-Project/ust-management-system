const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const Asset = require('../models/assets');

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

module.exports = router;
