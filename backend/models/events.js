const { executeTransaction } = require('../utils/queryExecutor');
const pool = require('../config/database');  // Adjust the path if necessary

const createEventsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Events (
      unique_id VARCHAR(20) PRIMARY KEY,
      event_name VARCHAR(100) NOT NULL,
      description TEXT,
      event_date DATE NOT NULL,
      event_start_time TIME NOT NULL,
      event_end_time TIME NOT NULL,
      event_location VARCHAR(255),
      is_completed BOOLEAN DEFAULT false,
      image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_assets JSONB
    )
  `;
  return executeTransaction([{ query, params: [] }]);
};

const getLastUniqueId = async () => {
  const query = "SELECT unique_id FROM Events ORDER BY unique_id DESC LIMIT 1";
  const result = await executeTransaction([{ query, params: [] }]);
  return result[0]?.unique_id || 'OSA-EVENT-0000';
};

const generateNextUniqueId = async () => {
  const lastId = await getLastUniqueId();
  const numPart = parseInt(lastId.split('-')[2]);
  const nextNum = numPart + 1;
  return `OSA-EVENT-${nextNum.toString().padStart(4, '0')}`;
};

const createEvent = async (data) => {
  const uniqueId = await generateNextUniqueId();
  const columns = Object.keys(data).join(", ") + ", unique_id";
  const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(", ") + `, $${Object.keys(data).length + 1}`;
  const query = `INSERT INTO Events (${columns}) VALUES (${placeholders}) RETURNING *`;
  const params = [...Object.values(data), uniqueId];
  return executeTransaction([{ query, params }]);
};

const readEvents = async () => {
  const query = "SELECT * FROM Events WHERE is_completed = false ORDER BY event_date ASC";
  const result = await pool.query(query);
  return result.rows;
};

const updateEvent = async (uniqueId, data) => {
  const setString = Object.keys(data)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(", ");
  const query = `UPDATE Events SET ${setString} WHERE unique_id = $${Object.keys(data).length + 1} RETURNING *`;
  const params = [...Object.values(data), uniqueId];
  return executeTransaction([{ query, params }]);
};

const deleteEvent = async (uniqueId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log(`Attempting to delete event with uniqueId: ${uniqueId}`);

    // First, return the assets to the main asset pool
    const returnAssetsQuery = `
      UPDATE assets a
      SET quantity = a.quantity + ea.quantity
      FROM event_assets ea
      WHERE ea.event_id = $1 AND ea.asset_id = a.asset_id
    `;
    const returnAssetsResult = await client.query(returnAssetsQuery, [uniqueId]);
    console.log(`Returned ${returnAssetsResult.rowCount} assets to the main pool`);

    // Then, delete associated records in the event_assets table
    const deleteAssetsQuery = "DELETE FROM event_assets WHERE event_id = $1";
    const deleteAssetsResult = await client.query(deleteAssetsQuery, [uniqueId]);
    console.log(`Deleted ${deleteAssetsResult.rowCount} associated assets`);

    // Now, delete the event
    const deleteEventQuery = "DELETE FROM Events WHERE unique_id = $1 RETURNING *";
    const deleteResult = await client.query(deleteEventQuery, [uniqueId]);

    if (deleteResult.rows.length > 0) {
      console.log(`Event deleted successfully: ${JSON.stringify(deleteResult.rows[0])}`);

      // Get all events with unique_id greater than the deleted event
      const selectQuery = "SELECT unique_id FROM Events WHERE unique_id > $1 ORDER BY unique_id";
      const selectResult = await client.query(selectQuery, [uniqueId]);
      console.log(`Found ${selectResult.rows.length} events to update`);

      // Update unique_ids of remaining events
      for (let i = 0; i < selectResult.rows.length; i++) {
        const updateUniqueId = selectResult.rows[i].unique_id;
        const newUniqueId = `OSA-EVENT-${(parseInt(updateUniqueId.split('-')[2]) - 1).toString().padStart(4, '0')}`;
        
        // Update the event_assets table first
        await client.query(
          'UPDATE event_assets SET event_id = $1 WHERE event_id = $2',
          [newUniqueId, updateUniqueId]
        );

        // Then update the Events table
        const updateQuery = "UPDATE Events SET unique_id = $1 WHERE unique_id = $2 RETURNING *";
        const updateResult = await client.query(updateQuery, [newUniqueId, updateUniqueId]);
        console.log(`Updated event ${updateUniqueId} to ${newUniqueId}`);
      }

      // Get the updated events
      const updatedEventsQuery = "SELECT * FROM Events ORDER BY unique_id";
      const updatedEventsResult = await client.query(updatedEventsQuery);

      await client.query('COMMIT');
      console.log(`Transaction committed successfully`);
      return updatedEventsResult.rows;
    } else {
      console.log(`No event found with uniqueId: ${uniqueId}`);
      await client.query('ROLLBACK');
      return [];
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in deleteEvent:', error);
    throw error;
  } finally {
    client.release();
  }
};

const getTotalEvents = async () => {
  const query = "SELECT COUNT(*) as total FROM Events";
  const result = await executeTransaction([{ query, params: [] }]);
  return result[0].total;
};

const getRecentEvents = async (limit = 5) => {
  try {
    const query = 'SELECT * FROM Events ORDER BY created_at DESC LIMIT $1';
    const result = await executeTransaction([{ query, params: [limit] }]);
    return result;
  } catch (error) {
    console.error('Error in getRecentEvents:', error);
    throw error;
  }
};

const addAssetsToEvent = async (eventId, assets) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const asset of assets) {
      console.log(`Processing asset ${asset.asset_id} for event ${eventId} with quantity ${asset.selectedQuantity}`);
      
      // Check if the asset already exists for this event
      const existingAssetQuery = 'SELECT * FROM event_assets WHERE event_id = $1 AND asset_id = $2';
      const existingAssetResult = await client.query(existingAssetQuery, [eventId, asset.asset_id]);
      
      if (existingAssetResult.rows.length > 0) {
        // Asset already exists, update its quantity
        const currentQuantity = existingAssetResult.rows[0].quantity;
        const newQuantity = currentQuantity + asset.selectedQuantity;
        await client.query(
          'UPDATE event_assets SET quantity = $1 WHERE event_id = $2 AND asset_id = $3',
          [newQuantity, eventId, asset.asset_id]
        );
        console.log(`Updated existing asset ${asset.asset_id} quantity from ${currentQuantity} to ${newQuantity}`);
      } else {
        // Asset doesn't exist, insert it
        await client.query(
          'INSERT INTO event_assets (event_id, asset_id, quantity) VALUES ($1, $2, $3)',
          [eventId, asset.asset_id, asset.selectedQuantity]
        );
        console.log(`Added new asset ${asset.asset_id} with quantity ${asset.selectedQuantity}`);
      }
      
      // Update asset quantity_for_borrowing
      console.log(`Updating asset ${asset.asset_id} quantity. Current: ${asset.quantity}, Deducting: ${asset.selectedQuantity}`);
      const newQuantity = asset.quantity - asset.selectedQuantity;
      await client.query(
        'UPDATE assets SET quantity = $1 WHERE asset_id = $2',
        [newQuantity, asset.asset_id]
      );
    }
    await client.query('COMMIT');
    console.log(`Assets successfully processed for event ${eventId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in addAssetsToEvent:', error);
    throw error;
  } finally {
    client.release();
  }
};

const createEventAssetsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS event_assets (
      id SERIAL PRIMARY KEY,
      event_id VARCHAR(20) REFERENCES Events(unique_id),
      asset_id VARCHAR(20) REFERENCES assets(asset_id),
      quantity INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  try {
    await pool.query(query);
    console.log('event_assets table created successfully');
  } catch (error) {
    console.error('Error creating event_assets table:', error);
    throw error;
  }
};

const getEventAssets = async (eventId) => {
  const query = `
    SELECT ea.asset_id, ea.quantity, a.assetName
    FROM event_assets ea
    JOIN assets a ON ea.asset_id = a.asset_id
    WHERE ea.event_id = $1
  `;
  const result = await pool.query(query, [eventId]);
  return result.rows;
};

const getEventById = async (eventId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Fetch event details
    const eventQuery = 'SELECT * FROM Events WHERE unique_id = $1';
    const eventResult = await client.query(eventQuery, [eventId]);
    
    if (eventResult.rows.length === 0) {
      return null;
    }

    const event = eventResult.rows[0];

    // Fetch associated assets
    const assetsQuery = `
      SELECT a.asset_id, a."assetName", ea.quantity
      FROM event_assets ea
      JOIN assets a ON ea.asset_id = a.asset_id
      WHERE ea.event_id = $1
    `;
    const assetsResult = await client.query(assetsQuery, [eventId]);

    event.assets = assetsResult.rows;

    await client.query('COMMIT');
    return event;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in getEventById:', error);
    throw error;
  } finally {
    client.release();
  }
};

const completeEvent = async (uniqueId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the current assets for the event with asset names
    const getAssetsQuery = `
      SELECT ea.*, a."assetName", a.quantity as total_quantity
      FROM event_assets ea
      JOIN assets a ON ea.asset_id = a.asset_id
      WHERE ea.event_id = $1
    `;
    const assetsResult = await client.query(getAssetsQuery, [uniqueId]);
    const completedAssets = assetsResult.rows.map(asset => ({
      asset_id: asset.asset_id,
      assetName: asset.assetName,
      quantity: asset.quantity,
      total_quantity: asset.total_quantity
    }));

    // Mark the event as completed and store the completed assets
    const updateEventQuery = "UPDATE Events SET is_completed = true, completed_assets = $1 WHERE unique_id = $2 RETURNING *";
    const updatedEvent = await client.query(updateEventQuery, [JSON.stringify(completedAssets), uniqueId]);
    console.log('Event marked as completed:', updatedEvent.rows[0]);

    // Return assets to the asset list
    const returnAssetsQuery = `
      UPDATE assets a
      SET quantity = a.quantity + ea.quantity
      FROM event_assets ea
      WHERE ea.event_id = $1 AND ea.asset_id = a.asset_id
    `;
    const returnAssetsResult = await client.query(returnAssetsQuery, [uniqueId]);
    console.log('Assets returned:', returnAssetsResult.rowCount);

    // Remove assets from event_assets table
    const deleteEventAssetsQuery = "DELETE FROM event_assets WHERE event_id = $1";
    const deleteEventAssetsResult = await client.query(deleteEventAssetsQuery, [uniqueId]);
    console.log('Event assets deleted:', deleteEventAssetsResult.rowCount);

    await client.query('COMMIT');
    return updatedEvent.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in completeEvent:', err);
    throw err;
  } finally {
    client.release();
  }
};

const getCompletedEvents = async () => {
  const query = "SELECT * FROM Events WHERE is_completed = true ORDER BY event_date DESC";
  const result = await pool.query(query);
  return result.rows.map(event => {
    let assets = [];
    if (typeof event.completed_assets === 'string') {
      try {
        assets = JSON.parse(event.completed_assets);
      } catch (error) {
        console.error(`Error parsing completed_assets for event ${event.unique_id}:`, error);
      }
    } else if (Array.isArray(event.completed_assets)) {
      assets = event.completed_assets;
    }
    return {
      ...event,
      assets: assets
    };
  });
};

const addIsCompletedColumn = async () => {
  const query = `
    ALTER TABLE Events
    ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;
  `;
  try {
    await pool.query(query);
    console.log('is_completed column added successfully');
  } catch (error) {
    console.error('Error adding is_completed column:', error);
    throw error;
  }
};

const updateAssetQuantity = async (eventId, assetId, newQuantity, oldQuantity) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Update the event_assets table
    await client.query(
      'UPDATE event_assets SET quantity = $1 WHERE event_id = $2 AND asset_id = $3',
      [newQuantity, eventId, assetId]
    );
    await client.query('COMMIT');
    return newQuantity;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in updateAssetQuantity:', error);
    throw error;
  } finally {
    client.release();
  }
};

const updateEventAssetQuantity = async (eventId, assetId, newQuantity) => {
  const query = 'UPDATE event_assets SET quantity = $1 WHERE event_id = $2 AND asset_id = $3 RETURNING *';
  const result = await pool.query(query, [newQuantity, eventId, assetId]);
  return result.rows[0];
};

const updateMainAssetQuantity = async (assetId, quantityDifference) => {
  const query = `
    UPDATE assets
    SET quantity = quantity - $1
    WHERE asset_id = $2
    RETURNING quantity
  `;
  
  try {
    const result = await pool.query(query, [quantityDifference, assetId]);
    return result.rows[0].quantity;
  } catch (error) {
    console.error('Error updating main asset quantity:', error);
    throw error;
  }
};

const getEventByName = async (eventName) => {
  const query = 'SELECT * FROM Events WHERE event_name = $1';
  const result = await pool.query(query, [eventName]);
  return result.rows[0];
};

module.exports = {
  createEventsTable,
  createEventAssetsTable,  // Make sure this line is here
  createEvent,
  readEvents,
  updateEvent,
  deleteEvent,
  getTotalEvents,
  getRecentEvents,
  addAssetsToEvent,
  createEventAssetsTable,
  getEventAssets,
  getEventById,
  completeEvent,
  addIsCompletedColumn,
  getCompletedEvents,
  updateAssetQuantity,
  updateEventAssetQuantity,
  updateMainAssetQuantity,
  getEventByName
};
