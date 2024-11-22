const express = require('express');
const router = express.Router();
const termsController = require('../controllers/termsAndConditionsController');

// GET /api/terms-and-conditions
router.get('/', termsController.getTermsAndConditions);

// PUT /api/terms-and-conditions
router.put('/', termsController.updateTermsAndConditions);

module.exports = router;
