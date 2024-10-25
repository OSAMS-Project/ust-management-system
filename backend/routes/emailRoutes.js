// routes/emailRoutes.js (or wherever the route is defined)
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/api/send-email', emailController.sendEmail);

module.exports = router;
