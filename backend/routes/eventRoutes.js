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
router.put('/:uniqueId/complete', eventController.completeEvent);

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
    console.log('Fetching cost for:', { eventId, assetId });
    
    // Simplified query - we only need the asset cost
    const query = `
      SELECT cost, "assetName"
      FROM assets
      WHERE asset_id = $1
    `;
    
    console.log('Executing query:', { query, assetId });
    const result = await pool.query(query, [assetId]);
    console.log('Query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('No cost found for asset:', assetId);
      return res.status(404).json({ message: 'Asset cost not found' });
    }

    const cost = parseFloat(result.rows[0].cost) || 0;
    const assetName = result.rows[0].assetName;
    
    console.log('Found cost:', { assetName, cost });
    res.json({ cost, assetName });
  } catch (error) {
    console.error('Error fetching asset cost:', error);
    res.status(500).json({ 
      message: 'Error fetching asset cost', 
      error: error.message 
    });
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
    const updatedEvent = await Event.completeEvent(uniqueId, returnQuantities);
    res.status(200).json({ 
      message: 'Event completed successfully', 
      updatedEvent: updatedEvent 
    });
  } catch (error) {
    console.error('Error completing event:', error);
    res.status(500).json({ error: 'Failed to complete event' });
  }
});

module.exports = router;
