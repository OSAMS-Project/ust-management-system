const Event = require('../models/events');
const pool = require('../config/database');

const createEvent = async (req, res) => {
  try {
    console.log("Received event data:", req.body);
    const eventData = {
      ...req.body,
      image: req.body.image || null
    };
    console.log("Processed event data:", eventData);

    // Check if an event with the same name already exists
    const existingEvent = await Event.getEventByName(eventData.event_name);
    if (existingEvent) {
      return res.status(400).json({ error: "An event with this name already exists" });
    }

    const result = await Event.createEvent(eventData);
    console.log("Create event result:", result);
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Detailed error in createEvent:", err);
    res.status(500).json({ error: err.message || "Error creating event" });
  }
};

const readEvents = async (req, res) => {
  try {
    const events = await Event.readEvents();
    // Filter out completed events
    const activeEvents = events.filter(event => !event.is_completed);
    res.status(200).json(activeEvents);
  } catch (err) {
    res.status(500).json({ error: "Error reading events", details: err.toString() });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const result = await Event.updateEvent(uniqueId, req.body);
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ error: "Event not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error updating event", details: err.toString() });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const result = await Event.deleteEvent(uniqueId);
    console.log(`Attempting to delete event with uniqueId: ${uniqueId}`);
    res.status(200).json({ message: "Event deleted successfully", updatedEvents: result });
  } catch (err) {
    console.error("Error in deleteEvent controller:", err);
    res.status(500).json({ error: "Error deleting event", details: err.toString() });
  }
};

const completeEvent = async (req, res) => {
  const { uniqueId } = req.params;
  try {
    await pool.query('BEGIN');
    
    // Get the current assets for the event with asset names
    const getAssetsQuery = `
      SELECT ea.*, a."assetName"
      FROM event_assets ea
      JOIN assets a ON ea.asset_id = a.asset_id
      WHERE ea.event_id = $1
    `;
    const assetsResult = await pool.query(getAssetsQuery, [uniqueId]);
    const completedAssets = assetsResult.rows.map(asset => ({
      asset_id: asset.asset_id,
      assetName: asset.assetName,
      quantity: asset.quantity
    }));
    // Mark the event as completed and store the completed assets
    const updateEventQuery = "UPDATE Events SET is_completed = true, completed_assets = $1 WHERE unique_id = $2 RETURNING *";
    const updatedEvent = await pool.query(updateEventQuery, [JSON.stringify(completedAssets), uniqueId]);
    console.log('Event marked as completed:', updatedEvent.rows[0]);
    // Return assets to the asset list
    const returnAssetsQuery = `
      UPDATE assets a
      SET quantity = a.quantity + ea.quantity
      FROM event_assets ea
      WHERE ea.event_id = $1 AND ea.asset_id = a.asset_id
    `;
    await pool.query(returnAssetsQuery, [uniqueId]);
    // Remove assets from event_assets table
    const deleteEventAssetsQuery = "DELETE FROM event_assets WHERE event_id = $1";
    await pool.query(deleteEventAssetsQuery, [uniqueId]);
    await pool.query('COMMIT');
    res.status(200).json({ message: 'Event completed successfully', updatedEvent: updatedEvent.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error completing event:', error);
    res.status(500).json({ error: 'Failed to complete event' });
  }
};

const getCompletedEvents = async (req, res) => {
  try {
    const completedEvents = await Event.getCompletedEvents();
    console.log('Completed events fetched:', completedEvents);
    res.status(200).json(completedEvents);
  } catch (err) {
    console.error('Error in getCompletedEvents:', err);
    res.status(500).json({ error: "Error fetching completed events", details: err.toString() });
  }
};

const updateAssetQuantity = async (req, res) => {
  const { eventId } = req.params;
  const { assetId, newQuantity, quantityDifference } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Update event_assets table
    const updateEventAssetQuery = `
      UPDATE event_assets 
      SET quantity = $1 
      WHERE event_id = $2 AND asset_id = $3
    `;
    await client.query(updateEventAssetQuery, [newQuantity, eventId, assetId]);

    // Update assets table
    const updateAssetQuery = `
      UPDATE assets 
      SET quantity = quantity - $1 
      WHERE asset_id = $2 
      RETURNING quantity
    `;
    const result = await client.query(updateAssetQuery, [quantityDifference, assetId]);
    const updatedAssetQuantity = result.rows[0].quantity;

    await client.query('COMMIT');

    res.json({ success: true, updatedAssetQuantity });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating asset quantity:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
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
