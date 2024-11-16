const Asset = require('../models/assets');
const AssetActivityLog = require('../models/assetactivitylogs');

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const oldAsset = await Asset.readAsset(id);
    const result = await Asset.updateAsset(req.body, id);
    
    const { modified_by, user_picture } = req.body;
    
    Object.keys(req.body).forEach(async (key) => {
      if (key !== 'modified_by' && key !== 'user_picture' && oldAsset[key] !== req.body[key]) {
        await AssetActivityLog.logAssetActivity(
          id,
          'update',
          key,
          oldAsset[key],
          req.body[key],
          modified_by,
          user_picture
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
    const { asset_id, action, changes, modified_by, user_picture } = req.body;
    const asset = await Asset.readAsset(asset_id);

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    const logs = await Promise.all(
      Object.entries(changes)
        .filter(([field, { oldValue, newValue }]) => {
          return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        })
        .map(([field, { oldValue, newValue }]) => {
          return AssetActivityLog.logAssetActivity(
            asset_id, 
            action, 
            field, 
            oldValue, 
            newValue,
            modified_by,
            user_picture
          );
        })
    );
    res.status(201).json(logs);
  } catch (err) {
    console.error("Error in createAssetActivityLog:", err);
    res.status(500).json({ error: "Error creating asset activity log", details: err.toString() });
  }
};

const logEventAllocation = async (req, res) => {
  try {
    const { assetId, quantity, eventName, modified_by, user_picture } = req.body;

    await AssetActivityLog.logEventAllocation(
      assetId, 
      quantity, 
      eventName, 
      modified_by,
      user_picture
    );
    res.status(201).json({ message: 'Event allocation logged successfully' });
  } catch (err) {
    console.error('Error in logEventAllocation:', err);
    res.status(500).json({ error: 'Error logging event allocation', details: err.toString() });
  }
};

module.exports = {
  updateAsset,
  getAssetActivityLogs,
  createAssetActivityLog,
  logEventAllocation,
};
