const express = require('express');
const router = express.Router();
const outgoingAssetsController = require('../controllers/outgoingAssetsController');

// Get all outgoing assets
router.get('/', outgoingAssetsController.getAllOutgoingAssets);

// Create new outgoing asset
router.post('/', outgoingAssetsController.createOutgoingAsset);

// Update outgoing asset
router.put('/:id', outgoingAssetsController.updateOutgoingAsset);

// Delete outgoing asset
router.delete('/:id', outgoingAssetsController.deleteOutgoingAsset);

module.exports = router; 