const Maintenance = require('../models/maintenance');
const pool = require('../config/database');

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

    // Get the asset and verify quantity using direct query
    const assetQuery = 'SELECT * FROM assets WHERE asset_id = $1';
    const assetResult = await pool.query(assetQuery, [maintenanceData.asset_id]);
    const asset = assetResult.rows[0];

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
    const newQuantity = asset.quantity - maintenanceQuantity;
    const updateQuantityQuery = 'UPDATE assets SET quantity = $1 WHERE asset_id = $2 RETURNING *';
    await pool.query(updateQuantityQuery, [newQuantity, maintenanceData.asset_id]);

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

const markMaintenanceComplete = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the maintenance record
    const maintenanceRecord = await Maintenance.getMaintenanceRecordById(id);
    if (!maintenanceRecord) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    // Check if maintenance is already completed
    if (maintenanceRecord.status === 'Completed' || maintenanceRecord.completion_date) {
      return res.status(400).json({ 
        error: 'Maintenance record is already completed'
      });
    }

    // Get the current asset using direct query
    const assetQuery = 'SELECT * FROM assets WHERE asset_id = $1';
    const assetResult = await pool.query(assetQuery, [maintenanceRecord.asset_id]);
    const asset = assetResult.rows[0];

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Get the maintenance quantity
    const maintenanceQuantity = parseInt(maintenanceRecord.maintenance_quantity) || 0;

    // Update the asset quantity - add back the maintenance quantity to main quantity
    const updateQuantityQuery = `
      UPDATE assets 
      SET quantity = quantity + $1
      WHERE asset_id = $2 
      RETURNING *
    `;
    await pool.query(updateQuantityQuery, [maintenanceQuantity, maintenanceRecord.asset_id]);

    // Update asset status
    const updateStatusQuery = `
      UPDATE assets 
      SET under_repair = false, 
          has_issue = false 
      WHERE asset_id = $1 
      RETURNING *
    `;
    await pool.query(updateStatusQuery, [maintenanceRecord.asset_id]);

    // Mark maintenance as complete
    const updatedRecord = await Maintenance.updateMaintenanceRecord(id, {
      status: 'Completed',
      completion_date: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Maintenance completed and quantity restored',
      maintenance: updatedRecord
    });

  } catch (error) {
    console.error('Error marking maintenance as complete:', error);
    res.status(500).json({ 
      error: 'Failed to complete maintenance record',
      details: error.message 
    });
  }
};

const restoreQuantityAndDelete = async (req, res) => {
  const { id } = req.params;
  const { asset_id, maintenance_quantity } = req.body;

  try {
    // Get the asset and maintenance record
    const assetQuery = 'SELECT * FROM assets WHERE asset_id = $1';
    const assetResult = await pool.query(assetQuery, [asset_id]);
    const asset = assetResult.rows[0];

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Parse maintenance quantity as integer
    const quantityToRestore = parseInt(maintenance_quantity);
    
    // Update asset with restored quantity
    const updateQuery = `
      UPDATE assets 
      SET quantity = quantity + $1 
      WHERE asset_id = $2 
      RETURNING *
    `;
    
    const updateResult = await pool.query(updateQuery, [quantityToRestore, asset_id]);

    // Delete maintenance record
    const deleteQuery = 'DELETE FROM maintenance_records WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    res.json({ 
      success: true, 
      message: 'Maintenance record deleted and quantity restored',
      updatedAsset: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error in restoreQuantityAndDelete:', error);
    res.status(500).json({ 
      error: 'Failed to restore quantity and delete maintenance record',
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
  getMaintenanceHistory,
  markMaintenanceComplete,
  restoreQuantityAndDelete
}; 