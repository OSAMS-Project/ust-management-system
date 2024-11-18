const Maintenance = require('../models/maintenance');
const Asset = require('../models/assets');

const maintenanceController = {
  getAllMaintenanceRecords: async (req, res) => {
    try {
      const records = await Maintenance.getAllMaintenanceRecords();
      res.json(records);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance records' });
    }
  },

  createMaintenanceRecord: async (req, res) => {
    try {
      const maintenanceData = req.body;
      
      // Validate required fields
      if (!maintenanceData.asset_id || !maintenanceData.maintenance_type || 
          !maintenanceData.scheduled_date || !maintenanceData.priority) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['asset_id', 'maintenance_type', 'scheduled_date', 'priority']
        });
      }

      // Validate maintenance_quantity
      if (maintenanceData.maintenance_quantity) {
        const quantity = parseInt(maintenanceData.maintenance_quantity);
        if (isNaN(quantity) || quantity < 1) {
          return res.status(400).json({
            error: 'Maintenance quantity must be a positive number'
          });
        }
        maintenanceData.maintenance_quantity = quantity;
      }

      const newRecord = await Maintenance.createMaintenanceRecord(maintenanceData);
      res.status(201).json(newRecord);
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      res.status(500).json({ 
        error: 'Failed to create maintenance record',
        details: error.message 
      });
    }
  },

  updateMaintenanceRecord: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate maintenance_quantity if it's being updated
      if (updateData.maintenance_quantity) {
        const quantity = parseInt(updateData.maintenance_quantity);
        if (isNaN(quantity) || quantity < 1) {
          return res.status(400).json({
            error: 'Maintenance quantity must be a positive number'
          });
        }
        updateData.maintenance_quantity = quantity;
      }

      const updatedRecord = await Maintenance.updateMaintenanceRecord(id, updateData);
      
      if (!updatedRecord) {
        return res.status(404).json({ error: 'Maintenance record not found' });
      }

      res.json(updatedRecord);
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      res.status(500).json({ 
        error: 'Failed to update maintenance record',
        details: error.message 
      });
    }
  },

  deleteMaintenanceRecord: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedRecord = await Maintenance.deleteMaintenanceRecord(id);
      
      if (!deletedRecord) {
        return res.status(404).json({ error: 'Maintenance record not found' });
      }

      res.json({ 
        message: 'Maintenance record deleted successfully',
        data: deletedRecord 
      });
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      res.status(500).json({ 
        error: 'Failed to delete maintenance record',
        details: error.message 
      });
    }
  },

  getMaintenanceHistory: async (req, res) => {
    try {
      const { assetId } = req.params;
      const history = await Maintenance.getMaintenanceHistory(assetId);
      res.json(history);
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
      res.status(500).json({ 
        error: 'Failed to fetch maintenance history',
        details: error.message 
      });
    }
  }
};

module.exports = maintenanceController; 