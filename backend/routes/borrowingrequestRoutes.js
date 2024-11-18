const express = require('express');
const borrowingRequestController = require('../controllers/borrowingRequestController');
const { executeTransaction } = require('../utils/queryExecutor');
const router = express.Router();

// Move the history route before the ID-specific routes to prevent conflicts
router.get('/history', borrowingRequestController.getBorrowingHistory);

router.post('/', borrowingRequestController.createBorrowingRequest);
router.get('/', borrowingRequestController.getAllBorrowingRequests);
router.put('/:id/status', borrowingRequestController.updateBorrowingRequestStatus);
router.get('/:id/cover-letter', borrowingRequestController.getCoverLetter);
router.get('/', borrowingRequestController.getAllBorrowingRequests);
router.put('/:id/return', borrowingRequestController.returnBorrowingRequest);
router.delete('/:id', borrowingRequestController.deleteBorrowingRequest);
router.post('/send-email', borrowingRequestController.sendManualEmail);
router.post('/notify-sms', borrowingRequestController.sendSMSReminder);

// Add this function at the top of the file
const checkPendingBorrowRequests = async (assetId) => {
  try {
    const query = `
      SELECT COALESCE(SUM(CAST((borrowed_asset->>'quantity') AS INTEGER)), 0) as total_requested
      FROM borrowing_requests br, 
      jsonb_array_elements(selected_assets) as borrowed_asset
      WHERE borrowed_asset->>'asset_id' = $1 
      AND br.status = 'Pending'
    `;
    const result = await executeTransaction([{ query, params: [assetId] }]);
    return parseInt(result[0].total_requested) || 0;
  } catch (error) {
    console.error('Error checking pending borrow requests:', error);
    throw error;
  }
};

// Update the pending requests endpoint
router.get('/pending/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    const total = await checkPendingBorrowRequests(assetId);
    res.json({ total_requested: total });
  } catch (error) {
    console.error('Error getting pending requests total:', error);
    res.status(500).json({ 
      error: 'Error getting pending requests total', 
      details: error.message 
    });
  }
});

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error in borrowing request routes:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = router;
