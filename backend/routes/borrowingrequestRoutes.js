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

router.put('/:id/return', async (req, res) => {
  try {
    const { id } = req.params;
    const returnDateTime = new Date().toISOString();

    // Start transaction
    await pool.query('BEGIN');

    // 1. Update borrowing request status
    const updateRequestQuery = {
      text: `
        UPDATE borrowing_requests 
        SET status = 'Returned', 
            return_date = $1
        WHERE id = $2 
        RETURNING *
      `,
      values: [returnDateTime, id]
    };

    // 2. Update borrow logs with correct column name (date_returned)
    const updateBorrowLogsQuery = {
      text: `
        UPDATE borrow_logs 
        SET 
          date_returned = $1,
          status = 'Returned'
        WHERE borrowing_request_id = $2
        RETURNING *
      `,
      values: [returnDateTime, id]
    };

    // Execute updates
    const requestResult = await pool.query(updateRequestQuery);
    const borrowLogResult = await pool.query(updateBorrowLogsQuery);

    // Debug logs
    console.log('Request update result:', requestResult.rows[0]);
    console.log('Borrow log update result:', borrowLogResult.rows[0]);

    if (requestResult.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        message: 'Borrowing request not found'
      });
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.json({
      message: 'Asset returned successfully',
      request: requestResult.rows[0],
      borrowLog: borrowLogResult.rows[0]
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error in return endpoint:', error);
    res.status(500).json({
      message: 'Error returning asset',
      error: error.message
    });
  }
});

module.exports = router;
