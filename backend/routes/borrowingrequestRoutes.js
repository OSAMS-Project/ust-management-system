const express = require('express');
const borrowingRequestController = require('../controllers/borrowingRequestController');
const router = express.Router();

// Move the history route before the ID-specific routes to prevent conflicts
router.get('/history', borrowingRequestController.getBorrowingHistory);

router.post('/', borrowingRequestController.createBorrowingRequest);
router.get('/', borrowingRequestController.getAllBorrowingRequests);
router.put('/:id/status', borrowingRequestController.updateBorrowingRequestStatus);
router.get('/:id/cover-letter', borrowingRequestController.getCoverLetter);
router.put('/:id/return', borrowingRequestController.returnBorrowingRequest);
router.delete('/:id', borrowingRequestController.deleteBorrowingRequest);
router.post('/send-email', borrowingRequestController.sendManualEmail);
router.post('/notify-sms', borrowingRequestController.sendSMSReminder);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error in borrowing request routes:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = router;
