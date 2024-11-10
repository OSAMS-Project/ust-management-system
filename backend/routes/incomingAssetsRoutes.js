const express = require('express');
const router = express.Router();
const incomingAssetsController = require('../controllers/incomingAssetsController');

// Create a new incoming asset
router.post('/', incomingAssetsController.createIncomingAsset);

// Get all incoming assets
router.get('/', incomingAssetsController.getAllIncomingAssets);

// Update incoming asset status
router.put('/:id/status', (req, res, next) => {
  console.log('Received PUT request for status update:', {
    params: req.params,
    body: req.body
  });
  next();
}, incomingAssetsController.updateIncomingAssetStatus);

module.exports = router; 