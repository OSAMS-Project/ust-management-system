const express = require('express');
const router = express.Router();
const incomingAssetController = require('../controllers/incomingassetcontroller');

router.get('/', incomingAssetController.getAllIncomingAssets);
router.post('/', incomingAssetController.addIncomingAsset);
router.put('/:id', incomingAssetController.updateIncomingAsset);
router.delete('/:id', incomingAssetController.deleteIncomingAsset);

module.exports = router;

