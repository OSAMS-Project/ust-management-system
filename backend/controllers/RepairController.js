const Repair = require('../models/Repair');
const Asset = require('../models/assets');

const getAllRepairRecords = async (req, res) => {
  try {
    const records = await Repair.getAllRepairRecords();
    res.json(records);
  } catch (error) {
    console.error('Error fetching repair records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createRepairRecord = async (req, res) => {
  try {
    console.log('Received repair data:', req.body);
    
    // Validate required fields
    if (!req.body.repair_type) {
      return res.status(400).json({ error: 'Repair type is required' });
    }
    if (!req.body.asset_id) {
      return res.status(400).json({ error: 'Asset ID is required' });
    }

    // Validate numeric fields
    const cost = parseFloat(req.body.cost);
    if (isNaN(cost)) {
      return res.status(400).json({ error: 'Cost must be a valid number' });
    }

    const quantity = parseInt(req.body.quantity);
    if (isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be a valid positive number' });
    }

    // Create repair record and update repair status only
    const [newRecord] = await Repair.createRepairRecord({
      ...req.body,
      cost: cost,
      quantity: quantity
    });
    
    // Only update the repair status, don't touch borrowing status
    await Asset.updateRepairStatus(req.body.asset_id, true);
    
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Error creating repair record:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      data: req.body 
    });
  }
};

const completeRepairRecord = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid repair record ID' });
    }

    const [record] = await Repair.completeRepairRecord(id);
    if (!record) {
      return res.status(404).json({ error: 'Repair record not found' });
    }

    // Asset status update is now handled within completeRepairRecord
    res.json(record);
  } catch (error) {
    console.error('Error completing repair record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteRepairRecord = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid repair record ID' });
    }

    const [deletedRecord] = await Repair.deleteRepairRecord(id);
    if (deletedRecord) {
      res.json({ message: 'Repair record deleted successfully', deletedRecord });
    } else {
      res.status(404).json({ error: 'Repair record not found' });
    }
  } catch (error) {
    console.error('Error deleting repair record:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRepairRecordsByAsset = async (assetId) => {
  try {
    const records = await Repair.getRepairRecordsByAsset(assetId);
    return records;
  } catch (error) {
    console.error('Error in getRepairRecordsByAsset:', error);
    throw error;
  }
};

// Exporting all methods as individual constants
module.exports = {
  getAllRepairRecords,
  createRepairRecord,
  completeRepairRecord,
  deleteRepairRecord,
  getRepairRecordsByAsset
};
