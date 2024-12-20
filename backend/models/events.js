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
      completed_at TIMESTAMP,
      completed_by VARCHAR(255),
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add image validation with 1MB limit
    if (data.image) {
      const imageData = data.image.split(',')[1] || data.image;
      const imageSize = Buffer.from(imageData, 'base64').length;
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      
      console.log('Image validation:', {
        sizeKB: Math.round(imageSize / 1024),
        sizeMB: (imageSize / (1024 * 1024)).toFixed(2),
        isBase64: data.image.includes('base64'),
      });

      if (imageSize > maxSize) {
        throw new Error(`Image size (${(imageSize / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size of 1MB`);
      }
    }

    const uniqueId = await generateNextUniqueId();
    
    const insertData = {
      ...data,
      unique_id: uniqueId,
      is_completed: false
    };

    const columns = Object.keys(insertData);
    const values = Object.values(insertData);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

    const query = `
      INSERT INTO Events (${columns.join(", ")}) 
      VALUES (${placeholders}) 
      RETURNING *
    `;

    const result = await client.query(query, values);
    await client.query('COMMIT');
    
    return [result.rows[0]];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createEvent:', {
      error: error.message,
      stack: error.stack,
      hasImage: !!data.image
    });
    throw error;
  } finally {
    client.release();
  }
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
    // First, get the events
    const eventsQuery = `
      SELECT e.* 
      FROM Events e 
      WHERE e.is_completed = false 
      ORDER BY e.created_at DESC 
      LIMIT $1
    `;
    const events = await pool.query(eventsQuery, [limit]);

    // Then, for each event, get its assets
    const eventsWithAssets = await Promise.all(
      events.rows.map(async (event) => {
        const assetsQuery = `
          SELECT 
            ea.id,
            ea.quantity,
            ea.cost,
            ea.created_at,
            a."assetName",
            a.asset_id
          FROM event_assets ea
          JOIN assets a ON ea.asset_id = a.asset_id
          WHERE ea.event_id = $1
        `;
        const assets = await pool.query(assetsQuery, [event.unique_id]);
        
        console.log(`Assets for event ${event.unique_id}:`, assets.rows);
        
        return {
          ...event,
          assets: assets.rows
        };
      })
    );

    console.log('Events with assets:', JSON.stringify(eventsWithAssets, null, 2));
    return eventsWithAssets;
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
      // Get the current asset details including cost, quantity, and type
      const assetDetailsQuery = 'SELECT cost, quantity, "totalCost", type FROM assets WHERE asset_id = $1';
      const assetDetails = await client.query(assetDetailsQuery, [asset.asset_id]);
      const assetData = assetDetails.rows[0];
      
      if (!assetData) {
        throw new Error(`Asset not found with ID: ${asset.asset_id}`);
      }

      const assetCost = assetData.cost || 0;
      const currentQuantity = assetData.quantity;
      const currentTotalCost = assetData.totalCost || 0;
      const isConsumable = assetData.type?.toLowerCase() === 'consumable';

      // Validate if we have enough quantity
      if (currentQuantity < asset.selectedQuantity) {
        throw new Error(`Insufficient quantity for asset ${asset.asset_id}. Available: ${currentQuantity}, Requested: ${asset.selectedQuantity}`);
      }

      // Calculate new quantity and total cost
      const newQuantity = currentQuantity - asset.selectedQuantity;
      
      // Only reduce total cost for consumable items
      let newTotalCost = currentTotalCost;
      if (isConsumable) {
        const costReduction = assetCost * asset.selectedQuantity;
        newTotalCost = currentTotalCost - costReduction;
      }

      // Update the main asset's quantity and total cost
      await client.query(
        'UPDATE assets SET quantity = $1, "totalCost" = $2 WHERE asset_id = $3',
        [newQuantity, newTotalCost, asset.asset_id]
      );

      console.log(`Processing asset ${asset.asset_id} for event ${eventId} with quantity ${asset.selectedQuantity}`);
      
      // Check if the asset already exists for this event
      const existingAssetQuery = 'SELECT * FROM event_assets WHERE event_id = $1 AND asset_id = $2';
      const existingAssetResult = await client.query(existingAssetQuery, [eventId, asset.asset_id]);
      
      if (existingAssetResult.rows.length > 0) {
        // Asset already exists, update its quantity and cost
        const currentEventQuantity = existingAssetResult.rows[0].quantity;
        const newEventQuantity = currentEventQuantity + asset.selectedQuantity;
        await client.query(
          'UPDATE event_assets SET quantity = $1, cost = $2 WHERE event_id = $3 AND asset_id = $4',
          [newEventQuantity, assetCost, eventId, asset.asset_id]
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
      a."assetName",
      a.type
    FROM event_assets ea
    JOIN assets a ON ea.asset_id = a.asset_id
    WHERE ea.event_id = $1
  `;
  
  try {
    const result = await pool.query(query, [eventId]);
    const assets = result.rows;
    
    return {
      consumables: assets.filter(asset => asset.type === 'Consumable'),
      nonConsumables: assets.filter(asset => asset.type !== 'Consumable')
    };
  } catch (error) {
    console.error('Error fetching event assets:', error);
    throw error;
  }
};

const getEventNonConsumables = async (eventId) => {
  const query = `
    SELECT 
      ea.asset_id,
      ea.quantity,
      a."assetName",
      a.type
    FROM event_assets ea
    JOIN assets a ON ea.asset_id = a.asset_id
    WHERE ea.event_id = $1 AND a.type != 'Consumable'
  `;
  
  try {
    const result = await pool.query(query, [eventId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching event non-consumables:', error);
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

const completeEvent = async (eventId, returnQuantities = {}, modifiedBy = null, userPicture = null) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Get event details first
    const eventQuery = 'SELECT event_name FROM Events WHERE unique_id = $1';
    const eventResult = await client.query(eventQuery, [eventId]);
    const eventName = eventResult.rows[0]?.event_name;

    if (!eventName) {
      throw new Error(`Event not found with ID: ${eventId}`);
    }

    // Get all event assets with their types and costs
    const assetsQuery = `
      SELECT ea.asset_id, ea.quantity, ea.cost, a.type, a."assetName", a."totalCost"
      FROM event_assets ea
      JOIN assets a ON ea.asset_id = a.asset_id
      WHERE ea.event_id = $1
    `;
    const assetsResult = await client.query(assetsQuery, [eventId]);
    const eventAssets = assetsResult.rows;

    // Handle consumable returns
    for (const [assetId, returnQty] of Object.entries(returnQuantities)) {
      if (returnQty > 0) {
        const asset = eventAssets.find(a => a.asset_id === assetId);
        if (asset && asset.type === 'Consumable') {
          // Calculate cost to return
          const costPerUnit = asset.cost || 0;
          const costToReturn = costPerUnit * returnQty;

          // Update quantity and total cost
          await client.query(
            `UPDATE assets 
             SET quantity = quantity + $1,
                 "totalCost" = "totalCost" + $2
             WHERE asset_id = $3`,
            [returnQty, costToReturn, assetId]
          );

          // Log consumable return
          await AssetActivityLog.logEventReturn(
            assetId,
            returnQty,
            eventName,
            modifiedBy,
            userPicture
          );
        } else {
          // For non-consumables, just update quantity
          await client.query(
            `UPDATE assets 
             SET quantity = quantity + $1
             WHERE asset_id = $2`,
            [returnQty, assetId]
          );
        }
      }
    }

    // Handle non-consumable returns
    const nonConsumableAssets = eventAssets.filter(asset => asset.type !== 'Consumable');
    for (const asset of nonConsumableAssets) {
      await client.query(
        `UPDATE assets 
         SET quantity = quantity + $1 
         WHERE asset_id = $2`,
        [asset.quantity, asset.asset_id]
      );

      // Log non-consumable return
      await AssetActivityLog.logEventReturn(
        asset.asset_id,
        asset.quantity,
        eventName,
        modifiedBy,
        userPicture
      );
    }

    // Store completed assets info and mark event as completed
    const completedAssetsInfo = eventAssets.map(asset => ({
      ...asset,
      returned_quantity: asset.type === 'Consumable' ? (returnQuantities[asset.asset_id] || 0) : asset.quantity
    }));

    await client.query(
      `UPDATE Events 
       SET is_completed = true,
           completed_at = CURRENT_TIMESTAMP,
           completed_assets = $1,
           completed_by = $2
       WHERE unique_id = $3`,
      [JSON.stringify(completedAssetsInfo), modifiedBy, eventId]
    );

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in completeEvent:', error);
    throw error;
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
    SET quantity = quantity + $1  -- Add the difference back to main inventory
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

const addCompletionColumns = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add completed_at column if it doesn't exist
    await client.query(`
      ALTER TABLE Events 
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS completed_by VARCHAR(255)
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding completion columns:', error);
    throw error;
  } finally {
    client.release();
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
  getEventConsumables,
  getEventNonConsumables,
  addCompletionColumns
};
