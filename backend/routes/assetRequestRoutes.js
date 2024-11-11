const express = require('express');
const router = express.Router();
const assetrequestController = require('../controllers/assetrequestController');

// Get all asset requests
router.get('/', assetrequestController.getAssetRequest);

// Add new asset request
router.post('/', assetrequestController.addAssetRequest);

// Update asset request status
router.put('/:id', assetrequestController.updateAssetRequest);

// Delete asset request
router.delete('/:id', assetrequestController.deleteAssetRequest);

// Approve asset request
router.put('/:id/approve', assetrequestController.approveAssetRequest);

// Decline asset request
router.put('/:id/decline', assetrequestController.declineAssetRequest);

// Get approved requests
router.get('/approved', assetrequestController.getApprovedRequests);

// Get declined requests
router.get('/declined', assetrequestController.getDeclinedRequests);

// Get archived requests
router.get('/archived', assetrequestController.getArchivedRequests);

// Archive request
router.put('/:id/archive', assetrequestController.archiveRequest);

// Restore request
router.put('/:id/restore', assetrequestController.restoreRequest);

module.exports = router;

