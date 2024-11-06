const Maintenance = require('../models/Maintenance');
const Asset = require('../models/assets');

const maintenanceController = {
  getAllMaintenanceRecords: async (req, res) => {
    try {
      const records = await Maintenance.getAllMaintenanceRecords();
      res.json(records);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  createMaintenanceRecord: async (req, res) => {
    try {
      console.log('Received maintenance data:', req.body);
      if (!req.body.maintenance_type) {
        return res.status(400).json({ error: 'Maintenance type is required' });
      }
      if (req.body.cost && isNaN(parseFloat(req.body.cost))) {
        return res.status(400).json({ error: 'Cost must be a number' });
      }

      // First deactivate borrowing if asset is active
      const asset = await Asset.readAsset(req.body.asset_id);
      if (asset.is_active) {
        await Asset.updateAssetActiveStatus(req.body.asset_id, false);
      }
      
      // Then create maintenance record and update maintenance status
      const newRecord = await Maintenance.createMaintenanceRecord(req.body);
      await Asset.updateMaintenanceStatus(req.body.asset_id, true);
      
      res.status(201).json(newRecord);
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  completeMaintenanceRecord: async (req, res) => {
    try {
      const record = await Maintenance.completeMaintenanceRecord(req.params.id, new Date());
      
      // Restore asset from maintenance
      if (record) {
        await Asset.updateMaintenanceStatus(record.asset_id, false);
      }
      
      res.json(record);
    } catch (error) {
      console.error('Error completing maintenance record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteMaintenanceRecord: async (req, res) => {
    try {
      const deletedRecord = await Maintenance.deleteMaintenanceRecord(req.params.id);
      if (deletedRecord) {
        res.json({ message: 'Maintenance record deleted successfully', deletedRecord });
      } else {
        res.status(404).json({ error: 'Maintenance record not found' });
      }
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getMaintenanceRecordsByAsset: async (req, res) => {
    try {
      const { assetId } = req.params;
      const records = await Maintenance.getMaintenanceRecordsByAsset(assetId);
      res.json(records);
    } catch (error) {
      console.error('Error fetching maintenance records for asset:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = maintenanceController;
