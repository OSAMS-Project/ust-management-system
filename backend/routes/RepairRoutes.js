const express = require('express');
const router = express.Router();
const Repair = require('../models/repair');

router.get('/read', async (req, res) => {
  try {
    const records = await Repair.getAllRepairRecords();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const result = await Repair.createRepairRecord(req.body);
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/complete/:id', async (req, res) => {
  try {
    const result = await Repair.completeRepairRecord(req.params.id, new Date());
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    await Repair.deleteRepairRecord(req.params.id);
    res.json({ message: 'Repair record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/asset/:id', async (req, res) => {
  try {
    const assetId = req.params.id;
    console.log('Fetching repair records for asset:', assetId);
    
    const records = await Repair.getRepairRecordsByAsset(assetId);
    console.log('Found records:', records);
    
    res.json(records);
  } catch (error) {
    console.error('Error in /asset/:id route:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

module.exports = router;
