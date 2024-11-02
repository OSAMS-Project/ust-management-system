const AssetRequest = require('../models/assetrequest');

const assetrequestController = {
  getAssetRequest: async (req, res) => {
    try {
      const assetrequests = await AssetRequest.getAssetRequest();
      console.log('Fetched asset requests:', assetrequests);
      res.json(assetrequests);
    } catch (error) {
      console.error('Error fetching asset requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  addAssetRequest: async (req, res) => {
    try {
      await AssetRequest.createAssetRequestTable();
      console.log('Received asset data:', req.body);
      const assetData = {
        ...req.body,
        created_by: req.body.created_by || 'unknown user',
        user_picture: req.body.user_picture || null
      };
      console.log('Asset data to be added:', assetData);
      const newAsset = await AssetRequest.addAssetRequest(assetData);
      console.log('New asset added:', newAsset);
      res.status(201).json(newAsset);
    } catch (error) {
      console.error('Error adding asset request:', error);
      res.status(500).json({ error: 'Internal server error', details: error.toString() });
    }
  },

  updateAssetRequest: async (req, res) => {
    try {
      const updatedAsset = await AssetRequest.updateAssetRequest(req.params.id, req.body);
      if (updatedAsset) {
        res.json(updatedAsset);
      } else {
        res.status(404).json({ error: 'Asset request not found' });
      }
    } catch (error) {
      console.error('Error updating asset request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteAssetRequest: async (req, res) => {
    try {
      const deletedAsset = await AssetRequest.deleteAssetRequest(req.params.id);
      if (deletedAsset) {
        res.json({ message: 'Asset request deleted successfully' });
      } else {
        res.status(404).json({ error: 'Asset request not found' });
      }
    } catch (error) {
      console.error('Error deleting asset request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = assetrequestController;
