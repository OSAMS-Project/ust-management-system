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

// Update the route to match the frontend request
router.put('/mark-complete/:id', maintenanceController.markMaintenanceComplete);
router.delete('/:id', maintenanceController.deleteMaintenanceRecord);

// Restore quantity and delete maintenance record
router.put('/restore-quantity/:id', maintenanceController.restoreQuantityAndDelete);

module.exports = router; 