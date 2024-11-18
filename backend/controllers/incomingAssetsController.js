const {
  createIncomingAsset,
  getAllIncomingAssets,
  getTotalIncomingAssets,
  updateIncomingAssetStatus,
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
      quantity,
      total_cost,
      expected_date,
      notes,
    } = req.body;

    // Convert empty strings to null for numeric fields
    const processedData = {
      assetName,
      description,
      type,
      category,
      cost: cost === "" ? null : Number(cost),
      quantity: quantity === "" ? null : Number(quantity),
      total_cost: total_cost === "" ? null : Number(total_cost),
      expected_date,
      notes,
    };

    const newAsset = await createIncomingAsset(processedData);
    res.status(201).json(newAsset);
  } catch (error) {
    console.error("Error creating incoming asset:", error);
    res.status(500).json({
      message: "Error creating incoming asset",
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
      message: "Error fetching all incoming assets",
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
      message: "Error fetching total incoming assets",
      error: error.message,
    });
  }
};

// Controller to update the status of an incoming asset
exports.updateIncomingAssetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location } = req.body;

    const updatedAsset = await updateIncomingAssetStatus(id, status, location);

    if (!updatedAsset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.status(200).json(updatedAsset);
  } catch (error) {
    console.error("Error updating asset status:", error);
    res.status(500).json({
      message: "Error updating asset status",
      error: error.message,
    });
  }
};
