const IncomingAsset = require('../models/incomingassets');

const incomingAssetController = {
  getAllIncomingAssets: async (req, res) => {
    try {
      const incomingAssets = await IncomingAsset.getAllIncomingAssets();
      res.json(incomingAssets);
    } catch (error) {
      console.error('Error fetching incoming assets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  addIncomingAsset: async (req, res) => {
    try {
      await IncomingAsset.createIncomingAssetsTable();
      console.log('Received asset data:', req.body);
      const assetData = {
        ...req.body,
        created_by: req.body.created_by || 'unknown user',
        user_picture: req.body.user_picture || null
      };
      console.log('Asset data to be added:', assetData);
      const newAsset = await IncomingAsset.addIncomingAsset(assetData);
      console.log('New asset added:', newAsset);
      res.status(201).json(newAsset);
    } catch (error) {
      console.error('Error adding incoming asset:', error);
      res.status(500).json({ error: 'Internal server error', details: error.toString() });
    }
  },

  updateIncomingAsset: async (req, res) => {
    try {
      const updatedAsset = await IncomingAsset.updateIncomingAsset(req.params.id, req.body);
      if (updatedAsset) {
        res.json(updatedAsset);
      } else {
        res.status(404).json({ error: 'Incoming asset not found' });
      }
    } catch (error) {
      console.error('Error updating incoming asset:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteIncomingAsset: async (req, res) => {
    try {
      const deletedAsset = await IncomingAsset.deleteIncomingAsset(req.params.id);
      if (deletedAsset) {
        res.json({ message: 'Incoming asset deleted successfully' });
      } else {
        res.status(404).json({ error: 'Incoming asset not found' });
      }
    } catch (error) {
      console.error('Error deleting incoming asset:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = incomingAssetController;
