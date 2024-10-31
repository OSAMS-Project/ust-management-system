const express = require('express');
const router = express.Router();
const supplierActivityLogController = require('../controllers/supplieractivitylogController');

router.get('/:id', supplierActivityLogController.getSupplierActivityLogs);
router.post('/', supplierActivityLogController.createSupplierActivityLog);

module.exports = router;
