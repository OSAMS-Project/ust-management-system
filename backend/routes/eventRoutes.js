const express = require('express');
const router = express.Router();
const Event = require('../models/events');
const { getEventById, updateAssetQuantity } = require('../models/events');
const eventController = require('../controllers/eventsController');
const pool = require('../config/database');

router.post('/create', eventController.createEvent);
router.get('/read', eventController.readEvents);
router.put('/update/:uniqueId', eventController.updateEvent);
router.delete('/delete/:uniqueId', eventController.deleteEvent);
router.get('/completed', eventController.getCompletedEvents);

router.get('/:eventId/assets', async (req, res) => {
  try {
    const { eventId } = req.params;
    const assets = await Event.getEventAssets(eventId);
    res.json(assets);
  } catch (error) {
    console.error('Error fetching event assets:', error);
    res.status(500).json({ error: 'Failed to fetch event assets' });
  }
});

router.get('/:eventId/nonConsumables', async (req, res) => {
  try {
    const { eventId } = req.params;
    const nonConsumables = await Event.getEventNonConsumables(eventId);
    res.json(nonConsumables);
  } catch (error) {
    console.error('Error fetching non-consumable assets:', error);
    res.status(500).json({ error: 'Failed to fetch non-consumable assets' });
  }
});

router.get('/:eventId/consumables', async (req, res) => {
  try {
    const consumables = await Event.getEventConsumables(req.params.eventId);
    res.json(consumables);
  } catch (error) {
    console.error('Error fetching consumables:', error);
    res.status(500).json({ error: 'Failed to fetch consumables' });
  }
});

router.put('/:uniqueId/complete', async (req, res) => {
  const { uniqueId } = req.params;
  const { returnQuantities } = req.body;
  
  try {
    const result = await Event.completeEvent(uniqueId, returnQuantities);
    res.json(result);
  } catch (error) {
    console.error('Error completing event:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to complete event',
      details: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:eventId/updateAssetQuantity', eventController.updateAssetQuantity);

router.get('/asset-cost/:eventId/:assetId', async (req, res) => {
  try {
    const { eventId, assetId } = req.params;
    const query = `
      SELECT cost, "assetName"
      FROM assets
      WHERE asset_id = $1
    `;
    const result = await pool.query(query, [assetId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Asset cost not found' });
    }

    const cost = parseFloat(result.rows[0].cost) || 0;
    const assetName = result.rows[0].assetName;
    
    res.json({ cost, assetName });
  } catch (error) {
    console.error('Error fetching asset cost:', error);
    res.status(500).json({ 
      message: 'Error fetching asset cost', 
      error: error.message 
    });
  }
});

module.exports = router;
