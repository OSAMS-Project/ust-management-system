const { findByAssetName } = require("../models/assets");
const {
  createIncomingAsset,
  getAllIncomingAssets,
  getIncomingAssetById,
  getTotalIncomingAssets,
  updateIncomingAssetStatus,
  deleteIncomingAsset,
} = require("../models/incomingassets");

// Controller to create a new incoming asset
exports.createIncomingAsset = async (req, res) => {
  try {
    const {
      assetName,
      description,
      type,
      category,
      cost,
      supplier,
      quantity,
      total_cost,
      expected_date,
      notes,
    } = req.body;

    // Validate required fields
    if (!assetName || !quantity) {
      return res.status(400).json({ message: "Asset name and quantity are required." });
    }

    // Convert empty strings to null for numeric fields
    const processedData = {
      assetName,
      description,
      type,
      category,
      cost: cost === "" ? null : Number(cost),
      supplier,
      quantity: Number(quantity),
      total_cost: total_cost === "" ? null : Number(total_cost),
      expected_date: expected_date || null,
      notes,
    };

    const newAsset = await createIncomingAsset(processedData);
    res.status(201).json({
      message: "Incoming asset successfully added.",
      asset: newAsset,
    });
  } catch (error) {
    console.error("Error creating incoming asset:", error);
    res.status(500).json({
      message: "Error creating incoming asset.",
      error: error.message,
    });
  }
};

// Controller to fetch all incoming assets
exports.getAllIncomingAssets = async (req, res) => {
  try {
    const assets = await getAllIncomingAssets();
    res.status(200).json(assets);
  } catch (error) {
    console.error("Error fetching all incoming assets:", error);
    res.status(500).json({
      message: "Error fetching all incoming assets.",
      error: error.message,
    });
  }
};

// Controller to fetch an incoming asset by ID
exports.getIncomingAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await getIncomingAssetById(id);

    if (!asset) {
      return res.status(404).json({ message: "Incoming asset not found." });
    }

    res.status(200).json(asset);
  } catch (error) {
    console.error("Error fetching incoming asset by ID:", error);
    res.status(500).json({
      message: "Error fetching incoming asset.",
      error: error.message,
    });
  }
};

// Controller to fetch the total number of incoming assets
exports.getTotalIncomingAssets = async (req, res) => {
  try {
    const total = await getTotalIncomingAssets();
    res.status(200).json({ total });
  } catch (error) {
    console.error("Error fetching total incoming assets:", error);
    res.status(500).json({
      message: "Error fetching total incoming assets.",
      error: error.message,
    });
  }
};

exports.updateIncomingAssetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location } = req.body;

    if (!id || !status || !location) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const updatedAsset = await updateIncomingAssetStatus(id, status, location);

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found." });
    }

    res.status(200).json({
      message: "Status updated successfully.",
      asset: updatedAsset,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// Controller to delete an incoming asset
exports.deleteIncomingAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAsset = await deleteIncomingAsset(id);

    if (!deletedAsset) {
      return res.status(404).json({ message: "Incoming asset not found." });
    }

    res.status(200).json({
      message: "Incoming asset deleted successfully.",
      asset: deletedAsset,
    });
  } catch (error) {
    console.error("Error deleting incoming asset:", error);
    res.status(500).json({
      message: "Error deleting incoming asset.",
      error: error.message,
    });
  }
};
