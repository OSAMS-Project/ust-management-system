const express = require('express');
const router = express.Router();
const MaintenanceController = require('../controllers/maintenanceController');

router.get('/read', MaintenanceController.getAllMaintenanceRecords);
router.post('/create', MaintenanceController.createMaintenanceRecord);
router.put('/complete/:id', MaintenanceController.completeMaintenanceRecord);
router.delete('/delete/:id', MaintenanceController.deleteMaintenanceRecord);

module.exports = router;

