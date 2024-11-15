const { executeTransaction } = require('../utils/queryExecutor');
const pool = require('../config/database');  // Adjust the path if necessary
const AssetActivityLog = require('../models/assetactivitylogs');

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
  try {
    const query = `
      SELECT COUNT(*) as count 
      FROM events 
      WHERE is_completed = false
    `;
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error in getTotalEvents:', error);
    return 0;
  }
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

    // First get the event name
    const eventQuery = 'SELECT event_name FROM Events WHERE unique_id = $1';
    const eventResult = await client.query(eventQuery, [eventId]);
    const eventName = eventResult.rows[0]?.event_name;

    if (!eventName) {
      throw new Error(`Event not found with ID: ${eventId}`);
    }

    for (const asset of assets) {
      // Get the current asset details including cost
      const assetDetailsQuery = 'SELECT cost FROM assets WHERE asset_id = $1';
      const assetDetails = await client.query(assetDetailsQuery, [asset.asset_id]);
      const assetCost = assetDetails.rows[0]?.cost || 0;

      console.log(`Processing asset ${asset.asset_id} for event ${eventId} with quantity ${asset.selectedQuantity}`);
      
      // Check if the asset already exists for this event
      const existingAssetQuery = 'SELECT * FROM event_assets WHERE event_id = $1 AND asset_id = $2';
      const existingAssetResult = await client.query(existingAssetQuery, [eventId, asset.asset_id]);
      
      if (existingAssetResult.rows.length > 0) {
        // Asset already exists, update its quantity and cost
        const currentQuantity = existingAssetResult.rows[0].quantity;
        const newQuantity = currentQuantity + asset.selectedQuantity;
        await client.query(
          'UPDATE event_assets SET quantity = $1, cost = $2 WHERE event_id = $3 AND asset_id = $4',
          [newQuantity, assetCost, eventId, asset.asset_id]
        );
      } else {
        // Asset doesn't exist, insert it with cost
        await client.query(
          'INSERT INTO event_assets (event_id, asset_id, quantity, cost) VALUES ($1, $2, $3, $4)',
          [eventId, asset.asset_id, asset.selectedQuantity, assetCost]
        );
      }

      // Log the event allocation - we'll skip the userId since it's not critical
      await AssetActivityLog.logEventAllocation(
        asset.asset_id,
        asset.selectedQuantity,
        eventName,
        null // userId is optional
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
      cost DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
};

const getEventAssets = async (eventId) => {
  const query = `
    SELECT 
      ea.asset_id, 
      ea.quantity,
      ea.cost as cost,
      a."assetName"
    FROM event_assets ea
    JOIN assets a ON ea.asset_id = a.asset_id
    WHERE ea.event_id = $1
  `;
  
  try {
    const result = await pool.query(query, [eventId]);
    console.log('Fetched event assets:', result.rows);
    return result.rows;
  } catch (error) {
    console.error('Error fetching event assets:', error);
    throw error;
  }
};

const getEventById = async (uniqueId) => {
  const client = await pool.connect();
  try {
    const eventQuery = `
      SELECT e.*, 
        COALESCE(json_agg(
          json_build_object(
            'asset_id', ea.asset_id,
            'quantity', ea.quantity,
            'cost', ea.cost,
            'assetName', a."assetName"
          )
        ) FILTER (WHERE ea.asset_id IS NOT NULL), '[]'::json) as assets
      FROM events e
      LEFT JOIN event_assets ea ON e.unique_id = ea.event_id
      LEFT JOIN assets a ON ea.asset_id = a.asset_id
      WHERE e.unique_id = $1
      GROUP BY e.unique_id`;

    const result = await client.query(eventQuery, [uniqueId]);
    console.log('Event details fetched:', result.rows[0]); // Debug log
    return result.rows[0];
  } catch (error) {
    console.error('Error in getEventById:', error);
    throw error;
  } finally {
    client.release();
  }
};

const completeEvent = async (uniqueId, returnQuantities = {}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the event name and assets
    const eventQuery = 'SELECT event_name FROM Events WHERE unique_id = $1';
    const eventResult = await client.query(eventQuery, [uniqueId]);
    const eventName = eventResult.rows[0]?.event_name;

    // Get all assets for this event with their current quantities
    const getAssetsQuery = `
      SELECT 
        ea.*,
        a."assetName",
        a.quantity as current_quantity,
        a.type
      FROM event_assets ea
      JOIN assets a ON ea.asset_id = a.asset_id
      WHERE ea.event_id = $1
    `;
    const assetsResult = await client.query(getAssetsQuery, [uniqueId]);
    
    const completedAssets = [];

    // Process each asset
    for (const asset of assetsResult.rows) {
      const returnQty = parseInt(returnQuantities[asset.asset_id] || 0);
      const originalQty = parseInt(asset.quantity);
      
      // Calculate how many were used/not returned
      const usedQty = originalQty - returnQty;

      // Update the main assets table with the returned quantity
      const updateAssetQuery = `
        UPDATE assets 
        SET quantity = quantity + $1
        WHERE asset_id = $2
        RETURNING quantity as new_quantity
      `;
      const updateResult = await client.query(updateAssetQuery, [returnQty, asset.asset_id]);
      
      // Log the activity
      await AssetActivityLog.logAssetActivity(
        asset.asset_id,
        'event_return',
        'quantity',
        asset.current_quantity.toString(),
        updateResult.rows[0].new_quantity.toString(),
        null,
        `Returned ${returnQty} units from event "${eventName}". ${usedQty} units were used.`
      );

      completedAssets.push({
        asset_id: asset.asset_id,
        assetName: asset.assetName,
        original_quantity: originalQty,
        returned_quantity: returnQty,
        used_quantity: usedQty,
        type: asset.type
      });
    }

    // Mark event as completed
    const updateEventQuery = `
      UPDATE Events 
      SET is_completed = true, 
          completed_assets = $1 
      WHERE unique_id = $2 
      RETURNING *
    `;
    const updatedEvent = await client.query(updateEventQuery, [
      JSON.stringify(completedAssets),
      uniqueId
    ]);

    // Remove assets from event_assets
    await client.query('DELETE FROM event_assets WHERE event_id = $1', [uniqueId]);

    await client.query('COMMIT');
    return {
      success: true,
      updatedEvent: updatedEvent.rows[0],
      completedAssets
    };
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

const getEventConsumables = async (eventId) => {
  const query = `
    SELECT 
      ea.asset_id,
      ea.quantity,
      a."assetName",
      a.type
    FROM event_assets ea
    JOIN assets a ON ea.asset_id = a.asset_id
    WHERE ea.event_id = $1 AND a.type = 'Consumable'
  `;
  
  try {
    const result = await pool.query(query, [eventId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching event consumables:', error);
    throw error;
  }
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
  getEventAssets,
  getEventById,
  completeEvent,
  addIsCompletedColumn,
  getCompletedEvents,
  updateAssetQuantity,
  updateEventAssetQuantity,
  updateMainAssetQuantity,
  getEventByName,
  getEventConsumables
};
