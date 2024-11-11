const Asset = require('../models/assets');

const createAsset = async (req, res) => {
  try {
    const assetData = { 
      ...req.body, 
      productCode: req.body.productCode || '',
      added_by: req.user ? req.user.name : 'Unknown User'
    };
    const result = await Asset.createAsset(assetData);
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Error creating asset:", err);
    res.status(500).json({ error: "Error creating asset", details: err.toString() });
  }
};

const readAssets = async (req, res) => {
  try {
    const assets = await Asset.readAssets();
    console.log('Assets from database:', JSON.stringify(assets, null, 2));
    res.json(assets);
  } catch (err) {
    console.error("Error reading assets:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ error: "Error reading assets", details: err.toString() });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Updating asset with ID:', id);
    console.log('Update data:', req.body);
    const result = await Asset.updateAsset(req.body, id);
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ error: "Asset not found" });
    }
  } catch (err) {
    console.error("Error in updateAsset:", err);
    res.status(500).json({ error: "Error updating asset", details: err.toString(), stack: err.stack });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const id = String(req.params.id);
    const deletedAsset = await Asset.deleteAsset(id);
    if (deletedAsset) {
      res.status(200).json({ 
        message: 'Asset, related maintenance records, borrow logs, and activity logs deleted successfully', 
        deletedAsset
      });
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (err) {
    console.error("Error deleting asset:", err);
    res.status(500).json({ 
      error: "Error deleting asset", 
      details: err.message,
      hint: "This may be due to related records in other tables. Please check all related data before deleting."
    });
  }
};

const updateAssetActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, quantityForBorrowing } = req.body; // Ensure this is being sent correctly
    const result = await Asset.updateAssetActiveStatus(id, isActive, quantityForBorrowing);
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (error) {
    console.error('Error updating asset active status:', error);
    res.status(500).json({ message: 'Error updating asset active status', error: error.message });
  }
};

const getTotalActiveAssets = async (req, res) => {
  try {
    const count = await Asset.getTotalActiveAssets();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: "Error getting total active assets", details: err.toString() });
  }
};

const getTotalAvailableAssets = async (req, res) => {
  try {
    const count = await Asset.getTotalAvailableAssets();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: "Error getting total available assets", details: err.toString() });
  }
};

const getAssetsSortedByActiveStatus = async (req, res) => {
  const { sortOrder } = req.query;
  try {
    const result = await Asset.getAssetsSortedByActiveStatus(sortOrder);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Error getting sorted assets", details: err.toString() });
  }
};

const getActiveAssets = async (req, res) => {
  try {
    const activeAssets = await Asset.getActiveAssets();
    res.status(200).json(activeAssets);
  } catch (err) {
    console.error('Error in getActiveAssets:', err);
    res.status(500).json({ error: "Error getting active assets", details: err.toString() });
  }
};

const updateAssetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const statusData = req.body;
    const result = await Asset.updateAssetStatus(id, statusData);
    
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (error) {
    console.error('Error updating asset status:', error);
    res.status(500).json({ 
      error: 'Error updating asset status', 
      details: error.message 
    });
  }
};

const updateAssetIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { has_issue } = req.body;
    const result = await Asset.updateAssetIssueStatus(id, has_issue);
    
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (error) {
    console.error('Error updating asset issue status:', error);
    res.status(500).json({ 
      error: 'Error updating asset issue status', 
      details: error.message 
    });
  }
};

module.exports = {
  createAsset,
  readAssets,
  updateAsset,
  deleteAsset,
  updateAssetActiveStatus,
  getTotalActiveAssets,
  getTotalAvailableAssets,
  getAssetsSortedByActiveStatus,
  getActiveAssets,
  updateAssetStatus,
  updateAssetIssueStatus
};
