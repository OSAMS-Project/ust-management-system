const Event = require('../models/events');
const pool = require('../config/database');

const createEvent = async (req, res) => {
  try {
    // Add debug logging for image
    if (req.body.image) {
      const base64Size = Buffer.from(req.body.image.split(',')[1], 'base64').length;
      const sizeInKB = base64Size / 1024;
      console.log('Image size:', {
        sizeKB: sizeInKB,
        sizeBytes: base64Size,
        truncatedImage: req.body.image.substring(0, 100) + '...' // Show start of image data
      });
    }

    console.log('Received event data:', {
      ...req.body,
      image: req.body.image ? '[Image Data]' : undefined
    });

    // Validate required fields
    const requiredFields = ['event_name', 'description', 'event_date', 'event_start_time', 'event_end_time', 'event_location'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // Format the date properly
    const formattedData = {
      ...req.body,
      event_date: new Date(req.body.event_date).toISOString().split('T')[0]
    };

    const result = await Event.createEvent(formattedData);
    console.log('Event created:', result); // Debug log
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      body: {
        ...req.body,
        image: req.body.image ? '[Image Data]' : undefined
      }
    });
    res.status(500).json({
      error: 'Failed to create event',
      details: error.message
    });
  }
};

const readEvents = async (req, res) => {
  try {
    const events = await Event.readEvents();
    res.json(events);
  } catch (error) {
    console.error('Error reading events:', error);
    res.status(500).json({ error: 'Failed to read events' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const result = await Event.updateEvent(uniqueId, req.body);
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const result = await Event.deleteEvent(uniqueId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

const completeEvent = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const { returnQuantities } = req.body;
    const { user } = req;

    const result = await Event.completeEvent(
      uniqueId, 
      returnQuantities,
      user?.email || user?.name || 'System',
      user?.picture
    );

    res.json(result);
  } catch (error) {
    console.error('Error completing event:', error);
    res.status(500).json({ error: error.message });
  }
};

const getCompletedEvents = async (req, res) => {
  try {
    const events = await Event.getCompletedEvents();
    res.json(events);
  } catch (error) {
    console.error('Error getting completed events:', error);
    res.status(500).json({ error: 'Failed to get completed events' });
  }
};

const updateAssetQuantity = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { assetId, newQuantity, quantityDifference } = req.body;

    if (newQuantity === undefined || newQuantity === null) {
      return res.status(400).json({ 
        success: false, 
        error: 'Quantity is required' 
      });
    }

    // Get current asset quantity
    const currentAssetQuery = 'SELECT quantity FROM assets WHERE asset_id = $1';
    const currentAssetResult = await pool.query(currentAssetQuery, [assetId]);
    
    if (currentAssetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found'
      });
    }

    const currentQuantity = currentAssetResult.rows[0].quantity;

    // If we're trying to increase allocated quantity (negative difference)
    if (quantityDifference < 0) {
      const additionalNeeded = Math.abs(quantityDifference);
      if (additionalNeeded > currentQuantity) {
        return res.status(400).json({
          success: false,
          error: `Cannot allocate more than available quantity. Available: ${currentQuantity}`
        });
      }
    }

    // If validation passes, proceed with updates
    const eventResult = await Event.updateEventAssetQuantity(eventId, assetId, newQuantity);
    const mainAssetResult = await Event.updateMainAssetQuantity(assetId, quantityDifference);

    res.json({ 
      success: true, 
      updatedEventQuantity: eventResult.quantity,
      updatedAssetQuantity: mainAssetResult,
      message: 'Asset quantities updated successfully'
    });
  } catch (error) {
    console.error('Error updating asset quantity:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update asset quantity' 
    });
  }
};

module.exports = {
  createEvent,
  readEvents,
  updateEvent,
  deleteEvent,
  completeEvent,
  getCompletedEvents,
  updateAssetQuantity
};
