const express = require("express");
const router = express.Router();
const incomingAssetsController = require("../controllers/incomingAssetsController");

// Create a new incoming asset
router.post("/", incomingAssetsController.createIncomingAsset);

// Get all incoming assets
router.get("/", incomingAssetsController.getAllIncomingAssets);

// Get a specific incoming asset by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await incomingAssetsController.getIncomingAssetById(id);
    if (!asset) {
      return res.status(404).json({ message: "Incoming asset not found" });
    }
    res.status(200).json(asset);
  } catch (error) {
    console.error("Error fetching incoming asset:", error);
    res.status(500).json({ message: "Failed to fetch incoming asset", error });
  }
});

// Update incoming asset status and location
router.put(
  "/:id/status",
  (req, res, next) => {
    console.log("Received PUT request for status update:", {
      params: req.params,
      body: req.body,
    });
    next();
  },
  incomingAssetsController.updateIncomingAssetStatus
);

// Delete an incoming asset
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAsset = await incomingAssetsController.deleteIncomingAsset(id);
    if (!deletedAsset) {
      return res.status(404).json({ message: "Incoming asset not found" });
    }
    res.status(200).json({ message: "Incoming asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting incoming asset:", error);
    res.status(500).json({ message: "Failed to delete incoming asset", error });
  }
});

// Get incoming assets filtered by status
router.get("/status/:status", async (req, res) => {
  try {
    const { status } = req.params;
    const assets = await incomingAssetsController.getIncomingAssetsByStatus(
      status
    );
    res.status(200).json(assets);
  } catch (error) {
    console.error("Error fetching incoming assets by status:", error);
    res.status(500).json({ message: "Failed to fetch incoming assets", error });
  }
});

// Get recent incoming assets
router.get("/recent/:limit", async (req, res) => {
  try {
    const { limit } = req.params;
    const assets = await incomingAssetsController.getRecentIncomingAssets(
      parseInt(limit, 10)
    );
    res.status(200).json(assets);
  } catch (error) {
    console.error("Error fetching recent incoming assets:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch recent incoming assets", error });
  }
});

module.exports = router;
