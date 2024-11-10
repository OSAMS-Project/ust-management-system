const IncomingAssets = require('../models/incomingassets');

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
      notes
    } = req.body;

    // Convert empty strings to null for numeric fields
    const processedData = {
      assetName,
      description,
      type,
      category,
      cost: cost === '' ? null : Number(cost),
      quantity: quantity === '' ? null : Number(quantity),
      total_cost: total_cost === '' ? null : Number(total_cost),
      expected_date,
      notes
    };

    const newAsset = await IncomingAssets.createIncomingAsset(processedData);
    res.status(201).json(newAsset);
  } catch (error) {
    console.error('Error creating incoming asset:', error);
    res.status(500).json({ message: 'Error creating incoming asset', error: error.message });
  }
};

exports.getAllIncomingAssets = async (req, res) => {
  try {
    const assets = await IncomingAssets.getAllIncomingAssets();
    res.status(200).json(assets);
  } catch (error) {
    console.error('Error getting incoming assets:', error);
    res.status(500).json({ message: 'Error getting incoming assets', error: error.message });
  }
};

exports.updateIncomingAssetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location } = req.body;
    
    const updatedAsset = await IncomingAssets.updateIncomingAssetStatus(id, status, location);
    
    if (!updatedAsset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    res.json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset status:', error);
    res.status(500).json({ message: 'Error updating asset status', error: error.message });
  }
}; 