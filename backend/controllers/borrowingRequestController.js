const BorrowingRequest = require("../models/borrowingrequest");
const Asset = require("../models/assets");
const path = require("path");
const fsSync = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const BorrowLogs = require("../models/borrowLogs");
const emailService = require("../services/emailService");
const pool = require("../config/database");
const axios = require("axios");

exports.createBorrowingRequest = async (req, res) => {
  try {
    const { recaptchaToken, ...requestData } = req.body; // Extract reCAPTCHA token and other request data

    // Step 1: Validate reCAPTCHA token with Google's API
    if (!recaptchaToken) {
      return res.status(400).json({ message: "reCAPTCHA token is required" });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Ensure this key is set in your environment variables
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: recaptchaToken,
        },
      }
    );

    const {
      success,
      score,
      "error-codes": errorCodes,
    } = recaptchaResponse.data;

    if (!success) {
      return res.status(400).json({
        message: "Failed reCAPTCHA verification",
        errors: errorCodes,
      });
    }

    if (score < 0.5) {
      return res.status(400).json({ message: "reCAPTCHA score too low" });
    }

    // Step 2: Process borrowing request after reCAPTCHA validation
    console.log("Creating borrowing request with data:", requestData);
    const requestId = await BorrowingRequest.createBorrowingRequest(
      requestData
    );

    res.status(201).json({
      message: "Borrowing request created successfully",
      requestId: requestId,
    });
  } catch (error) {
    console.error("Error in createBorrowingRequest:", error);
    res.status(500).json({
      message: "Error creating borrowing request",
      error: error.message,
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
      `,
    };

    const result = await pool.query(query);
    console.log("Query result:", result.rows[0]); // Debug log

    const requests = result.rows.map((row) => ({
      ...row,
      borrowed_asset_names:
        Array.isArray(row.asset_details) && row.asset_details[0] !== null
          ? row.asset_details.map((a) => a.assetName).join(", ")
          : "N/A",
      borrowed_asset_quantities:
        Array.isArray(row.asset_details) && row.asset_details[0] !== null
          ? row.asset_details.map((a) => a.quantity).join(", ")
          : "N/A",
    }));

    console.log("Processed requests:", requests[0]); // Debug log
    res.json(requests);
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: "Error fetching borrowing requests" });
  }
};

exports.updateBorrowingRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    // Get the borrowing request details first
    const request = await BorrowingRequest.getBorrowingRequestById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Borrowing request not found" });
    }

    // If approving the request, check quantities first
    if (status === "Approved") {
      const selectedAssets =
        typeof request.selected_assets === "string"
          ? JSON.parse(request.selected_assets)
          : request.selected_assets;

      // Check each asset's available quantity
      for (const asset of selectedAssets) {
        const assetDetails = await Asset.readAsset(asset.asset_id);
        if (!assetDetails) {
          return res.status(400).json({
            message: `Asset ${asset.asset_id} not found`,
          });
        }

        // Check if requested quantity exceeds available quantity
        if (asset.quantity > assetDetails.quantity_for_borrowing) {
          return res.status(400).json({
            message: `Cannot approve request. Requested quantity (${asset.quantity}) exceeds available quantity (${assetDetails.quantity_for_borrowing}) for asset ${assetDetails.assetName}`,
          });
        }
      }
    }

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

        // Send approval email only here, not in frontend
        await emailService.sendApprovalEmail(
          updatedRequest.email,
          updatedRequest.name
        );
      } else if (status === "Rejected" && req.body.rejectionReason) {
        // Send rejection email with reason if status is rejected
        await emailService.sendRejectionEmail(
          updatedRequest.email,
          updatedRequest.name,
          req.body.rejectionReason
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
exports.getBorrowedAssetsFrequency = async (req, res) => {
  try {
    // Query for assets from approved borrowing requests, grouped by asset name
    const currentQuery = `
      SELECT 
        sa->>'assetName' AS asset_name,
        COUNT(DISTINCT br.id) AS borrow_frequency
      FROM borrowing_requests br
      CROSS JOIN jsonb_array_elements(br.selected_assets::jsonb) sa
      WHERE br.status = 'Approved' -- Only include approved requests
      GROUP BY sa->>'assetName'
    `;

    // Query the current borrowing data
    const currentResult = await pool.query(currentQuery);

    // Process the current borrowing data into a frequency object
    const currentFrequency = {};
    currentResult.rows.forEach((row) => {
      currentFrequency[row.asset_name] = parseInt(row.borrow_frequency, 10);
    });

    // Return the frequency data
    res.status(200).json(currentFrequency);
  } catch (error) {
    console.error("Error fetching borrowed assets frequency:", error);
    res.status(500).json({ error: "Error fetching borrowed assets frequency" });
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

exports.getCoverLetter = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching cover letter for request ID:", id);

    const query = {
      text: `
        SELECT cover_letter_path, cover_letter_url
        FROM borrowing_requests 
        WHERE id = $1
      `,
      values: [id],
    };

    const result = await pool.query(query);
    console.log("Database result:", result.rows);

    if (!result.rows || result.rows.length === 0) {
      console.log("No record found for ID:", id);
      return res.status(404).json({ message: "Cover letter not found" });
    }

    const record = result.rows[0];
    console.log("Cover letter record:", record);

    if (!record.cover_letter_path && !record.cover_letter_url) {
      console.log("No cover letter path or URL found");
      return res.status(404).json({ message: "Cover letter not found" });
    }

    // If we have a URL, redirect to it
    if (record.cover_letter_url) {
      return res.redirect(record.cover_letter_url);
    }

    // Otherwise, try to send the file
    if (record.cover_letter_path) {
      const filePath = path.resolve(record.cover_letter_path);
      console.log("Resolved file path:", filePath);

      if (!fsSync.existsSync(filePath)) {
        console.log("File does not exist at path:", filePath);
        return res.status(404).json({ message: "Cover letter file not found" });
      }

      return res.sendFile(filePath, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).json({ message: "Error sending cover letter" });
        }
      });
    }
  } catch (error) {
    console.error("Error in getCoverLetter:", error);
    res.status(500).json({
      message: "Failed to retrieve cover letter",
      error: error.message,
    });
  }
};

exports.returnBorrowingRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    console.log("Starting return process for request ID:", requestId);

    // Start transaction
    await pool.query("BEGIN");

    // 1. Get the request and its assets
    const getRequestQuery = {
      text: `
        SELECT * FROM borrowing_requests 
        WHERE id = $1 AND status = 'Approved'
        FOR UPDATE
      `,
      values: [requestId],
    };

    const requestResult = await pool.query(getRequestQuery);

    if (requestResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({
        message: "Borrowing request not found or already returned",
      });
    }

    const request = requestResult.rows[0];
    const selectedAssets =
      typeof request.selected_assets === "string"
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
        values: [parseInt(asset.quantity), asset.asset_id],
      };

      const assetResult = await pool.query(updateAssetQuery);
      console.log(
        `Updated quantity for asset ${asset.asset_id}:`,
        assetResult.rows[0]
      );
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
      values: [requestId],
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
      values: [requestId],
    };

    await pool.query(updateLogsQuery);

    // Commit transaction
    await pool.query("COMMIT");

    res.status(200).json({
      message: "Asset returned successfully",
      request: updatedRequest.rows[0],
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Return process error:", error);
    res.status(500).json({
      message: "Error returning assets",
      error: error.message,
    });
  }
};

exports.deleteBorrowingRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const deletedRequest = await BorrowingRequest.deleteBorrowingRequest(
      requestId
    );

    if (deletedRequest) {
      res.status(200).json({
        success: true,
        message: "Borrowing request deleted successfully",
        data: deletedRequest,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Borrowing request not found",
      });
    }
  } catch (error) {
    console.error("Error deleting borrowing request:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting borrowing request",
      error: error.message,
    });
  }
};

exports.getBorrowingHistory = async (req, res) => {
  try {
    console.log("Fetching borrowing history...");
    const history = await BorrowingRequest.getBorrowingHistory();
    console.log("History fetched:", history);
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching borrowing history:", error);
    res.status(500).json({
      message: "Error fetching borrowing history",
      error: error.message,
    });
  }
};

exports.getSingleBorrowingRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM borrowing_request 
      WHERE id = $1
    `;

    const result = await executeTransaction([{ query, params: [id] }]);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Borrowing request not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching single borrowing request:", error);
    res.status(500).json({
      message: "Error fetching borrowing request",
      error: error.message,
    });
  }
};

let verificationCodes = {}; // Temporary in-memory storage for codes. Replace with a database in production.

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const code = await emailService.sendVerificationEmail(email);
    verificationCodes[email] = code; // Store the code temporarily
    setTimeout(() => delete verificationCodes[email], 300000); // Expire the code after 5 minutes
    res.status(200).json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Error sending verification code:", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};

exports.verifyCode = (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: "Email and code are required" });
  }

  if (verificationCodes[email] && verificationCodes[email] == code) {
    delete verificationCodes[email]; // Invalidate the code once verified
    res.status(200).json({ message: "Verification successful" });
  } else {
    res.status(400).json({ message: "Invalid or expired verification code" });
  }
};
exports.sendPendingAlertEmail = async (req, res) => {
  const { email, pendingCount } = req.body;

  if (!email || !pendingCount || pendingCount <= 5) {
    return res.status(400).json({
      message: "Email and pending count greater than 5 are required.",
    });
  }

  try {
    await emailService.sendPendingAlertEmail(email, pendingCount);
    res.status(200).json({ message: "Pending alert email sent successfully." });
  } catch (error) {
    console.error("Error sending pending alert email:", error);
    res.status(500).json({
      message: "Failed to send pending alert email.",
      error: error.message,
    });
  }
};

exports.sendReminderEmail = async (req, res) => {
  const { email, name, expectedReturnDate } = req.body;

  if (!email || !name || !expectedReturnDate) {
    return res.status(400).json({
      message: "Email, name, and expected return date are required.",
    });
  }

  try {
    await emailService.sendReminderEmail(email, name, expectedReturnDate);
    res.status(200).json({ message: "SMS sent successfully" });
  } catch (error) {
    console.error("Error sending SMS reminder:", error);
    res
      .status(500)
      .json({ message: "Error sending SMS reminder", error: error.message });
  }
};
