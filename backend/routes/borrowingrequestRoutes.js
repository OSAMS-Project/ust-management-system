const express = require("express");
const borrowingRequestController = require("../controllers/borrowingRequestController");
const { executeTransaction } = require("../utils/queryExecutor");
const router = express.Router();
const { checkPendingBorrowRequests } = require("../controllers/assetController");

// History route
router.get("/history", borrowingRequestController.getBorrowingHistory);

// Verification routes
router.post(
  "/send-verification-code",
  borrowingRequestController.sendVerificationCode
);
router.post("/verify-code", borrowingRequestController.verifyCode);

// Borrowing requests routes
router.post("/", borrowingRequestController.createBorrowingRequest);
router.get("/", borrowingRequestController.getAllBorrowingRequests);
router.put(
  "/:id/status",
  borrowingRequestController.updateBorrowingRequestStatus
);
router.get("/:id/cover-letter", borrowingRequestController.getCoverLetter);
router.put("/:id/return", borrowingRequestController.returnBorrowingRequest);
router.delete("/:id", borrowingRequestController.deleteBorrowingRequest);
router.post("/send-email", borrowingRequestController.sendManualEmail);
router.post("/notify-email", borrowingRequestController.sendReminderEmail);

// Pending requests
router.get("/pending/:assetId", async (req, res) => {
  try {
    const { assetId } = req.params;
    const total = await checkPendingBorrowRequests(assetId);
    res.json({ total_requested: total });
  } catch (error) {
    console.error("Error getting pending requests total:", error);
    res.status(500).json({
      error: "Error getting pending requests total",
      details: error.message,
    });
  }
});

// Single borrowing request
router.get("/:id", borrowingRequestController.getSingleBorrowingRequest);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error("Error in borrowing request routes:", err);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

module.exports = router;
