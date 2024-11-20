const Maintenance = require('../models/maintenance');
const Asset = require('../models/assets');

const getAllMaintenanceRecords = async (req, res) => {
  try {
    const records = await Maintenance.getAllMaintenanceRecords();
    res.json(records);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
};

const createMaintenanceRecord = async (req, res) => {
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

    // Get the asset and verify quantity
    const asset = await Asset.readAsset(maintenanceData.asset_id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const maintenanceQuantity = parseInt(maintenanceData.quantity) || 1;
    if (maintenanceQuantity > asset.quantity) {
      return res.status(400).json({
        error: 'Maintenance quantity cannot exceed available asset quantity'
      });
    }

    // Update asset quantity
    await Asset.updateQuantity(
      maintenanceData.asset_id, 
      asset.quantity - maintenanceQuantity
    );

    // Create maintenance record with the quantity
    const newRecord = await Maintenance.createMaintenanceRecord({
      ...maintenanceData,
      maintenance_quantity: maintenanceQuantity
    });

    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({ 
      error: 'Failed to create maintenance record',
      details: error.message 
    });
  }
};

const updateMaintenanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If marking as completed
    if (updateData.completion_date) {
      const maintenanceRecord = await Maintenance.getMaintenanceRecordById(id);
      if (maintenanceRecord) {
        // Update the asset quantity directly using updateMainAssetQuantity from events model
        await Asset.updateMainAssetQuantity(
          maintenanceRecord.asset_id,
          -maintenanceRecord.maintenance_quantity  // Negative because we want to add back
        );

        await Asset.updateAssetStatus(maintenanceRecord.asset_id, {
          under_repair: false,
          has_issue: false
        });
      }
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
};

const deleteMaintenanceRecord = async (req, res) => {
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
};

const getMaintenanceHistory = async (req, res) => {
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
};

// Exporting all methods as individual constants
module.exports = {
  getAllMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceHistory
}; 