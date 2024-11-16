const BorrowingRequest = require("../models/borrowingrequest");
const Asset = require("../models/assets");
const path = require("path");
const fsSync = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const BorrowLogs = require("../models/borrowLogs");
const emailService = require("../services/emailService");
const {sendSMS} = require("../services/smsService");

exports.createBorrowingRequest = [
  upload.single("coverLetter"),
  async (req, res) => {
    try {
      console.log("Received request body:", req.body);

      const {
        name,
        email,
        department,
        purpose,
        contactNo,
        selectedAssets,
        expectedReturnDate,
        dateToBeCollected,
        notes,
      } = req.body;

      // Validate required fields
      if (!name || !email || !department || !purpose || !contactNo) {
        return res.status(400).json({
          message: "Missing required fields",
          fields: { name, email, department, purpose, contactNo },
          received: req.body
        });
      }

      // Save cover letter path if uploaded
      let coverLetterPath = null;
      if (req.file) {
        coverLetterPath = req.file.path;
      }

      // Parse selected assets JSON if provided
      let parsedSelectedAssets = [];
      try {
        parsedSelectedAssets = selectedAssets ? JSON.parse(selectedAssets) : [];
        console.log('Parsed selected assets:', parsedSelectedAssets);
      } catch (error) {
        console.error("Error parsing selectedAssets:", error);
        return res.status(400).json({
          message: "Invalid selectedAssets format",
          error: error.message,
          received: selectedAssets
        });
      }

      // Get dateToBeCollected from the first asset if not provided directly
      const finalDateToBeCollected = dateToBeCollected || parsedSelectedAssets[0]?.dateToBeCollected;

      if (!finalDateToBeCollected) {
        return res.status(400).json({
          message: "Missing dateToBeCollected",
          received: { dateToBeCollected, selectedAssets: parsedSelectedAssets }
        });
      }

      // Create borrowing request entry
      const newRequest = await BorrowingRequest.createBorrowingRequest({
        name,
        email,
        department,
        purpose,
        contactNo,
        coverLetterPath,
        selectedAssets: parsedSelectedAssets,
        expectedReturnDate,
        dateToBeCollected: finalDateToBeCollected,
        notes,
      });

      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error creating borrowing request:", error);
      res.status(500).json({
        message: "Error creating borrowing request",
        error: error.message,
      });
    }
  },
];

exports.getAllBorrowingRequests = async (req, res) => {
  try {
    const requests = await BorrowingRequest.getAllBorrowingRequests();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching borrowing requests",
      error: error.message,
    });
  }
};

exports.updateBorrowingRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.id;

    // Update instead of delete for rejected requests
    const updatedRequest = await BorrowingRequest.updateBorrowingRequestStatus(
      requestId,
      status
    );

    if (updatedRequest) {
      if (status === "Approved") {
        const selectedAssets = updatedRequest.selected_assets;
        await Promise.all(
          selectedAssets.map(async (asset) => {
            await Asset.updateAssetQuantity(
              asset.asset_id,
              -parseInt(asset.quantity, 10)
            );
          })
        );

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
    const request = await BorrowingRequest.getBorrowingRequestById(requestId);
    const returnDateTime = new Date(); // Capture the exact moment return button is clicked

    if (!request) {
      return res.status(404).json({ message: "Borrowing request not found" });
    }

    const selectedAssets = request.selected_assets;
    await Promise.all(
      selectedAssets.map(async (asset) => {
        await Asset.updateAssetQuantity(asset.asset_id, asset.quantity);
      })
    );

    const updatedRequest = await BorrowingRequest.updateBorrowingRequestStatus(
      requestId,
      "Returned",
      returnDateTime
    );

    await BorrowLogs.updateBorrowLogReturnDate(requestId, returnDateTime);

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error returning assets:", error);
    res
      .status(500)
      .json({ message: "Error returning assets", error: error.message });
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
