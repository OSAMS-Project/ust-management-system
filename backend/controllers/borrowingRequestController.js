const BorrowingRequest = require("../models/borrowingrequest");
const Asset = require("../models/assets");
const path = require("path");
const fs = require("fs").promises;
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
      console.log("Received request:", {
        body: req.body,
        file: req.file,
        headers: req.headers,
        method: req.method,
        url: req.url,
      });

      const {
        name,
        email,
        department,
        purpose,
        contactNo,
        selectedAssets,
        expectedReturnDate,
        notes,
      } = req.body;

      // Validate required fields
      if (!name || !email || !department || !purpose || !contactNo) {
        return res.status(400).json({
          message: "Missing required fields",
          fields: { name, email, department, purpose, contactNo },
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
      } catch (error) {
        console.error("Error parsing selectedAssets:", error);
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

    if (status === "Rejected") {
      await BorrowingRequest.deleteBorrowingRequest(requestId);
      return res.status(200).json({
        message: "Borrowing request rejected and deleted successfully.",
      });
    }

    const updatedRequest = await BorrowingRequest.updateBorrowingRequestStatus(
      requestId,
      status
    );
    if (updatedRequest) {
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

      if (status === "Approved") {
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
  const { email, name, status } = req.body;

  if (!email || !name || !status) {
    return res
      .status(400)
      .json({ message: "Email, name, and status are required." });
  }

  try {
    if (status === "Approved") {
      await emailService.sendApprovalEmail(email, name);
    } else if (status === "Rejected") {
      await emailService.sendRejectionEmail(email, name);
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
      "Returned"
    );

    await BorrowLogs.updateBorrowLogReturnDate(requestId, new Date());

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error returning assets:", error);
    res
      .status(500)
      .json({ message: "Error returning assets", error: error.message });
  }
};
