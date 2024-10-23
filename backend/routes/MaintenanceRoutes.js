const express = require('express');
const router = express.Router();
const MaintenanceController = require('../controllers/MaintenanceController');

router.get('/read', MaintenanceController.getAllMaintenanceRecords);
router.post('/create', MaintenanceController.createMaintenanceRecord);
router.put('/complete/:id', MaintenanceController.completeMaintenanceRecord);
router.delete('/delete/:id', MaintenanceController.deleteMaintenanceRecord);
router.get('/asset/:assetId', MaintenanceController.getMaintenanceRecordsByAsset);

module.exports = router;
