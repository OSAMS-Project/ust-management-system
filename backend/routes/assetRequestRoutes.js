const express = require('express');
const router = express.Router();
const assetrequestController = require('../controllers/assetrequestController');

router.get('/', assetrequestController.getAssetRequest);
router.post('/', assetrequestController.addAssetRequest);
router.put('/:id', assetrequestController.updateAssetRequest);
router.delete('/:id', assetrequestController.deleteAssetRequest);

module.exports = router;

