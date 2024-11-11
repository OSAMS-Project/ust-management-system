const Repair = require('../models/Repair');
const Asset = require('../models/assets');

const repairController = {
  getAllRepairRecords: async (req, res) => {
    try {
      const records = await Repair.getAllRepairRecords();
      res.json(records);
    } catch (error) {
      console.error('Error fetching repair records:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  createRepairRecord: async (req, res) => {
    try {
      console.log('Received repair data:', req.body);
      if (!req.body.repair_type) {
        return res.status(400).json({ error: 'Repair type is required' });
      }
      if (req.body.cost && isNaN(parseFloat(req.body.cost))) {
        return res.status(400).json({ error: 'Cost must be a number' });
      }

      // First deactivate borrowing if asset is active
      const asset = await Asset.readAsset(req.body.asset_id);
      if (asset.is_active) {
        await Asset.updateAssetActiveStatus(req.body.asset_id, false);
      }
      
      // Then create repair record and update repair status
      const [newRecord] = await Repair.createRepairRecord(req.body);
      await Asset.updateRepairStatus(req.body.asset_id, true);
      
      res.status(201).json(newRecord);
    } catch (error) {
      console.error('Error creating repair record:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  },

  completeRepairRecord: async (req, res) => {
    try {
      const [record] = await Repair.completeRepairRecord(req.params.id, new Date());
      
      // Restore asset from repair
      if (record) {
        await Asset.updateRepairStatus(record.asset_id, false);
      }
      
      res.json(record);
    } catch (error) {
      console.error('Error completing repair record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteRepairRecord: async (req, res) => {
    try {
      const [deletedRecord] = await Repair.deleteRepairRecord(req.params.id);
      if (deletedRecord) {
        res.json({ message: 'Repair record deleted successfully', deletedRecord });
      } else {
        res.status(404).json({ error: 'Repair record not found' });
      }
    } catch (error) {
      console.error('Error deleting repair record:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getRepairRecordsByAsset: async (req, res) => {
    try {
      const { assetId } = req.params;
      const records = await Repair.getRepairRecordsByAsset(assetId);
      res.json(records);
    } catch (error) {
      console.error('Error fetching repair records for asset:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = repairController;
