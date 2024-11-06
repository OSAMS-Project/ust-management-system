const express = require('express');
const borrowingRequestController = require('../controllers/borrowingRequestController');
const router = express.Router();

router.post('/', borrowingRequestController.createBorrowingRequest);
router.get('/', borrowingRequestController.getAllBorrowingRequests);
router.put('/:id/status', borrowingRequestController.updateBorrowingRequestStatus);
router.get('/:id/cover-letter', borrowingRequestController.getCoverLetter);

// Route for returning assets
router.put('/:id/return', borrowingRequestController.returnBorrowingRequest);
router.post('/send-email', borrowingRequestController.sendManualEmail);
router.post('/notify-sms', borrowingRequestController.sendSMSReminder);

// Add this route if it doesn't exist
router.delete('/:id', borrowingRequestController.deleteBorrowingRequest);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error in borrowing request routes:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = router;
