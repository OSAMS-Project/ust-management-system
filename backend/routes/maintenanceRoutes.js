const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

// Get all maintenance records
router.get('/', maintenanceController.getAllMaintenanceRecords);

// Create new maintenance record
router.post('/', maintenanceController.createMaintenanceRecord);

// Update maintenance record
router.put('/:id', maintenanceController.updateMaintenanceRecord);

// Delete maintenance record
router.delete('/:id', maintenanceController.deleteMaintenanceRecord);

// Get maintenance history for an asset
router.get('/history/:assetId', maintenanceController.getMaintenanceHistory);

module.exports = router; 