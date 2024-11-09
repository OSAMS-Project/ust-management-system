const express = require('express');
const router = express.Router();
const assetrequestController = require('../controllers/assetrequestController');

router.get('/', assetrequestController.getAssetRequest);
router.post('/', assetrequestController.addAssetRequest);
router.put('/:id', assetrequestController.updateAssetRequest);
router.delete('/:id', assetrequestController.deleteAssetRequest);
router.put('/:id/approve', assetrequestController.approveAssetRequest);
router.put('/:id/decline', assetrequestController.declineAssetRequest);
router.get('/approved', assetrequestController.getApprovedRequests);
router.get('/declined', assetrequestController.getDeclinedRequests);
router.get('/archived', assetrequestController.getArchivedRequests);
router.put('/:id/archive', assetrequestController.archiveRequest);
router.put('/:id/restore', assetrequestController.restoreRequest);

module.exports = router;

