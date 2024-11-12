const AssetRequest = require('../models/assetrequest');

const assetrequestController = {
  getAssetRequest: async (req, res) => {
    try {
      const assetrequests = await AssetRequest.getAssetRequest();
      console.log('Fetched asset requests:', assetrequests);
      res.json(assetrequests);
    } catch (error) {
      console.error('Error fetching asset requests:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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
  },

  approveAssetRequest: async (req, res) => {
    try {
      console.log('Approving asset request with ID:', req.params.id);
      const updatedAsset = await AssetRequest.updateAssetRequest(req.params.id, { 
        status: 'approved' 
      });
      console.log('Updated asset:', updatedAsset);
      
      if (updatedAsset) {
        res.json(updatedAsset);
      } else {
        res.status(404).json({ error: 'Asset request not found' });
      }
    } catch (error) {
      console.error('Error approving asset request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  declineAssetRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { auto_declined, declined_at } = req.body;

      const updatedAsset = await AssetRequest.updateAssetRequest(id, { 
        status: 'declined',
        auto_declined: auto_declined || false,
        declined_at: declined_at || new Date().toISOString()
      });
      
      if (updatedAsset) {
        // Return the complete updated request
        res.json({
          ...updatedAsset,
          auto_declined: auto_declined || false,
          declined_at: declined_at || new Date().toISOString()
        });
      } else {
        res.status(404).json({ error: 'Asset request not found' });
      }
    } catch (error) {
      console.error('Error declining asset request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getApprovedRequests: async (req, res) => {
    try {
      const approvedRequests = await AssetRequest.getApprovedRequests();
      res.json(approvedRequests);
    } catch (error) {
      console.error('Error getting approved requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getDeclinedRequests: async (req, res) => {
    try {
      const declinedRequests = await AssetRequest.getDeclinedRequests();
      res.json(declinedRequests);
    } catch (error) {
      console.error('Error getting declined requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getArchivedRequests: async (req, res) => {
    try {
      const archivedRequests = await AssetRequest.getArchivedRequests();
      res.json(archivedRequests);
    } catch (error) {
      console.error('Error in getArchivedRequests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  archiveRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const archivedRequest = await AssetRequest.archiveRequest(id);
      res.json(archivedRequest);
    } catch (error) {
      console.error('Error in archiveRequest:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  restoreRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const restoredRequest = await AssetRequest.restoreRequest(id);
      res.json(restoredRequest);
    } catch (error) {
      console.error('Error in restoreRequest:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = assetrequestController;
