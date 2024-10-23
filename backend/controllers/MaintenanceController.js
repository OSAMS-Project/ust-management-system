const Maintenance = require('../models/Maintenance');

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
      const newRecord = await Maintenance.createMaintenanceRecord(req.body);
      res.status(201).json(newRecord);
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  completeMaintenanceRecord: async (req, res) => {
    try {
      const { id } = req.params;
      const fixedDate = new Date();
      const updatedRecord = await Maintenance.completeMaintenanceRecord(id, fixedDate);
      if (updatedRecord) {
        res.json(updatedRecord);
      } else {
        res.status(404).json({ error: 'Maintenance record not found' });
      }
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
