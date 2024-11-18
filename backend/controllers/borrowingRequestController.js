const BorrowingRequest = require("../models/borrowingrequest");
const Asset = require("../models/assets");
const path = require("path");
const fsSync = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const BorrowLogs = require("../models/borrowLogs");
const emailService = require("../services/emailService");
const {sendSMS} = require("../services/smsService");
const pool = require("../config/database");

exports.createBorrowingRequest = async (req, res) => {
  try {
    const requestData = {
      name: req.body.name,
      email: req.body.email,
      department: req.body.department,
      purpose: req.body.purpose,
      contactNo: req.body.contactNo,
      coverLetterUrl: req.body.coverLetterUrl,
      selectedAssets: req.body.selectedAssets,
      expectedReturnDate: req.body.expectedReturnDate,
      dateToBeCollected: req.body.dateToBeCollected,
      notes: req.body.notes
    };

    console.log('Creating borrowing request with data:', requestData);

    const requestId = await BorrowingRequest.createBorrowingRequest(requestData);
    
    res.status(201).json({
      message: 'Borrowing request created successfully',
      requestId: requestId
    });
  } catch (error) {
    console.error('Error in createBorrowingRequest:', error);
    res.status(500).json({
      message: 'Error creating borrowing request',
      error: error.message
    });
  }
};

exports.getAllBorrowingRequests = async (req, res) => {
  try {
    const query = {
      text: `
        SELECT 
          br.*,
          json_agg(
            json_build_object(
              'assetName', a."assetName",
              'quantity', (sa->>'quantity')
            )
          ) as asset_details
        FROM borrowing_requests br
        CROSS JOIN jsonb_array_elements(br.selected_assets::jsonb) sa
        LEFT JOIN assets a ON a.asset_id = (sa->>'assetId')::text
        GROUP BY br.id, br.name, br.email, br.department, br.purpose, 
                 br.contact_no, br.date_requested, br.date_to_be_collected, 
                 br.expected_return_date, br.status, br.notes, br.cover_letter_url
        ORDER BY br.date_requested DESC;
      `
    };

    const result = await pool.query(query);
    console.log('Query result:', result.rows[0]); // Debug log

    const requests = result.rows.map(row => ({
      ...row,
      borrowed_asset_names: Array.isArray(row.asset_details) && row.asset_details[0] !== null
        ? row.asset_details.map(a => a.assetName).join(', ')
        : 'N/A',
      borrowed_asset_quantities: Array.isArray(row.asset_details) && row.asset_details[0] !== null
        ? row.asset_details.map(a => a.quantity).join(', ')
        : 'N/A'
    }));

    console.log('Processed requests:', requests[0]); // Debug log
    res.json(requests);

  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ message: 'Error fetching borrowing requests' });
  }
};

exports.updateBorrowingRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    // Update the request status
    const updatedRequest = await BorrowingRequest.updateBorrowingRequestStatus(
      requestId,
      status
    );

    if (updatedRequest) {
      if (status === "Approved") {
        // Update asset quantities
        const selectedAssets = updatedRequest.selected_assets;
        await Promise.all(
          selectedAssets.map(async (asset) => {
            await Asset.updateAssetQuantity(
              asset.asset_id,
              -parseInt(asset.quantity, 10)
            );
          })
        );

        // Create borrow logs
        for (const asset of selectedAssets) {
          await BorrowLogs.createBorrowLog({
            assetId: asset.asset_id,
            quantityBorrowed: parseInt(asset.quantity, 10),
            borrowerName: updatedRequest.name,
            borrowerEmail: updatedRequest.email,
            borrowerDepartment: updatedRequest.department,
            dateBorrowed: new Date(),
            dateReturned: null,
            borrowingRequestId: requestId,
          });
        }

        // Send approval email
        await emailService.sendApprovalEmail(
          updatedRequest.email,
          updatedRequest.name
        );
      }

      res.status(200).json(updatedRequest);
    } else {
      res.status(404).json({ message: "Borrowing request not found" });
    }
  } catch (error) {
    console.error("Error updating borrowing request status:", error);
    res.status(500).json({
      message: "Error updating borrowing request status",
      error: error.message,
    });
  }
};

exports.sendManualEmail = async (req, res) => {
  const { email, name, status, rejectionReason } = req.body;

  if (!email || !name || !status) {
    return res
      .status(400)
      .json({ message: "Email, name, and status are required." });
  }

  try {
    if (status === "Approved") {
      await emailService.sendApprovalEmail(email, name);
    } else if (status === "Rejected") {
      await emailService.sendRejectionEmail(email, name, rejectionReason);
    } else {
      return res.status(400).json({ message: "Invalid status provided." });
    }

    res
      .status(200)
      .json({ message: `Email sent successfully for status: ${status}` });
  } catch (error) {
    console.error("Error sending manual email:", error);
    res
      .status(500)
      .json({ message: "Error sending email", error: error.message });
  }
};

exports.sendSMSReminder = async (req, res) => {
  const { contactNo, name, expectedReturnDate } = req.body;

  if (!contactNo || !name || !expectedReturnDate) {
    return res.status(400).json({
      message: "Contact number, name, and expected return date are required.",
    });
  }

  try {
    await sendSMS(contactNo, name, expectedReturnDate);
    res.status(200).json({ message: "SMS sent successfully" });
  } catch (error) {
    console.error("Error sending SMS reminder:", error);
    res
      .status(500)
      .json({ message: "Error sending SMS reminder", error: error.message });
  }
};

exports.getCoverLetter = async (req, res) => {
  try {
    const request = await BorrowingRequest.getBorrowingRequestById(
      req.params.id
    );
    if (!request || !request.cover_letter_path) {
      return res.status(404).json({ message: "Cover letter not found" });
    }
    const absolutePath = path.resolve(request.cover_letter_path);

    if (!fsSync.existsSync(absolutePath)) {
      return res.status(404).json({ message: "Cover letter file not found" });
    }

    res.contentType("application/pdf");
    const fileStream = fsSync.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error fetching cover letter:", error);
    res
      .status(500)
      .json({ message: "Error fetching cover letter", error: error.message });
  }
};

exports.returnBorrowingRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    console.log('Starting return process for request ID:', requestId);

    // Start transaction
    await pool.query('BEGIN');

    // 1. Get the request and its assets
    const getRequestQuery = {
      text: `
        SELECT * FROM borrowing_requests 
        WHERE id = $1 AND status = 'Approved'
        FOR UPDATE
      `,
      values: [requestId]
    };

    const requestResult = await pool.query(getRequestQuery);

    if (requestResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ 
        message: 'Borrowing request not found or already returned' 
      });
    }

    const request = requestResult.rows[0];
    const selectedAssets = typeof request.selected_assets === 'string'
      ? JSON.parse(request.selected_assets)
      : request.selected_assets;

    // 2. Update asset quantities
    for (const asset of selectedAssets) {
      const updateAssetQuery = {
        text: `
          UPDATE assets 
          SET quantity_for_borrowing = quantity_for_borrowing + $1
          WHERE asset_id = $2
          RETURNING asset_id, quantity_for_borrowing
        `,
        values: [parseInt(asset.quantity), asset.asset_id]
      };

      const assetResult = await pool.query(updateAssetQuery);
      console.log(`Updated quantity for asset ${asset.asset_id}:`, assetResult.rows[0]);
    }

    // 3. Update request status
    const updateRequestQuery = {
      text: `
        UPDATE borrowing_requests 
        SET 
          status = 'Returned',
          date_returned = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `,
      values: [requestId]
    };

    const updatedRequest = await pool.query(updateRequestQuery);

    // 4. Update borrow logs
    const updateLogsQuery = {
      text: `
        UPDATE borrow_logs 
        SET date_returned = CURRENT_TIMESTAMP
        WHERE borrowing_request_id = $1
        AND date_returned IS NULL
      `,
      values: [requestId]
    };

    await pool.query(updateLogsQuery);

    // Commit transaction
    await pool.query('COMMIT');

    res.status(200).json({
      message: 'Asset returned successfully',
      request: updatedRequest.rows[0]
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Return process error:', error);
    res.status(500).json({ 
      message: 'Error returning assets', 
      error: error.message 
    });
  }
};

exports.deleteBorrowingRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const deletedRequest = await BorrowingRequest.deleteBorrowingRequest(requestId);
    
    if (deletedRequest) {
      res.status(200).json({
        success: true,
        message: "Borrowing request deleted successfully",
        data: deletedRequest
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Borrowing request not found"
      });
    }
  } catch (error) {
    console.error('Error deleting borrowing request:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting borrowing request",
      error: error.message
    });
  }
};

exports.getBorrowingHistory = async (req, res) => {
  try {
    console.log('Fetching borrowing history...');
    const history = await BorrowingRequest.getBorrowingHistory();
    console.log('History fetched:', history);
    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching borrowing history:', error);
    res.status(500).json({
      message: 'Error fetching borrowing history',
      error: error.message
    });
  }
};
