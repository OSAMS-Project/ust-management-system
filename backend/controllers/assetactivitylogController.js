const Asset = require('../models/assets');
const AssetActivityLog = require('../models/assetactivitylogs');

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const oldAsset = await Asset.readAsset(id);
    const result = await Asset.updateAsset(req.body, id);
    
    // Log changes
    Object.keys(req.body).forEach(async (key) => {
      if (oldAsset[key] !== req.body[key]) {
        await AssetActivityLog.logAssetActivity(
          id,
          'update',
          key,
          oldAsset[key],
          req.body[key],
          req.user.id // Assuming you have user information in the request
        );
      }
    });

    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ error: "Asset not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error updating asset", details: err.toString() });
  }
};

const getAssetActivityLogs = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching activity logs for asset ID:", id);
    const logs = await AssetActivityLog.getAssetActivityLogs(id);
    res.json(logs);
  } catch (err) {
    console.error("Error in getAssetActivityLogs:", err);
    res.status(500).json({ error: "Error fetching asset activity logs", details: err.toString() });
  }
};

const createAssetActivityLog = async (req, res) => {
  try {
    const { asset_id, action, changes } = req.body;
    const asset = await Asset.readAsset(asset_id);

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    const logs = await Promise.all(
      Object.entries(changes)
        .filter(([field, { oldValue, newValue }]) => {
          // Only log fields that have actually changed
          return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        })
        .map(([field, { oldValue, newValue }]) => {
          if (field === 'quantityForBorrowing' && !asset.is_active) {
            return null;
          }
          return AssetActivityLog.logAssetActivity(asset_id, action, field, oldValue, newValue);
        })
        .filter(log => log !== null)
    );
    res.status(201).json(logs);
  } catch (err) {
    console.error("Error in createAssetActivityLog:", err);
    res.status(500).json({ error: "Error creating asset activity log", details: err.toString() });
  }
};

module.exports = {
  updateAsset,
  getAssetActivityLogs,
  createAssetActivityLog,
};
