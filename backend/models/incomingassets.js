const pool = require("../config/database");
const { executeTransaction } = require("../utils/queryExecutor");

const createIncomingAssetsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS incoming_assets (
      id SERIAL PRIMARY KEY,
      asset_id VARCHAR(20),
      "assetName" VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL,
      category VARCHAR(100) NOT NULL,
      cost NUMERIC(10,2),
      quantity INTEGER NOT NULL CHECK (quantity >= 0),
      total_cost NUMERIC(10,2) GENERATED ALWAYS AS (cost * quantity) STORED,
      expected_date TIMESTAMP WITH TIME ZONE,
      status VARCHAR(50) DEFAULT 'pending',
      location VARCHAR(100),
      supplier VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await pool.query(query);
};

const createIncomingAsset = async (assetData) => {
  const query = `
    INSERT INTO incoming_assets 
    ("assetName", description, type, category, cost, quantity, total_cost, expected_date, notes, supplier)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  const params = [
    assetData.assetName,
    assetData.description,
    assetData.type,
    assetData.category,
    assetData.cost || null,
    assetData.quantity,
    assetData.total_cost || null,
    assetData.expected_date || null,
    assetData.notes || null,
    assetData.supplier || null,
  ];

  try {
    const result = await pool.query(query, params);
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting incoming asset:', error.message);
    throw new Error(error.message);
  }
};




const updateIncomingAssetStatus = async (id, status, location) => {
  const query = `
    UPDATE incoming_assets
    SET status = $1, location = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *;
  `;
  const params = [status, location, id];
  const result = await executeTransaction([{ query, params }]);
  return result[0]; // Return the updated record
};

const getAllIncomingAssets = async () => {
  const query = `
    SELECT 
      id, "assetName", type, category, quantity, 
      total_cost, supplier, expected_date, status 
    FROM incoming_assets
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};



const getIncomingAssetById = async (id) => {
  const query = "SELECT * FROM incoming_assets WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0]; // Includes supplier
};
// Get the total number of incoming assets
const getTotalIncomingAssets = async () => {
  const query = `
    SELECT COUNT(*) AS total 
    FROM incoming_assets 
    WHERE status = 'pending'
  `;
  const result = await pool.query(query);
  return parseInt(result.rows[0].total, 10);
};

// Delete an incoming asset
const deleteIncomingAsset = async (id) => {
  const query = "DELETE FROM incoming_assets WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Fetch incoming assets filtered by status
const getIncomingAssetsByStatus = async (status) => {
  const query = `
    SELECT * 
    FROM incoming_assets 
    WHERE status = $1 
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query, [status]);
  return result.rows;
};

// Fetch recent incoming assets
const getRecentIncomingAssets = async (limit) => {
  const query = `
    SELECT * 
    FROM incoming_assets 
    ORDER BY created_at DESC 
    LIMIT $1
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
};

// Export all functions
module.exports = {
  createIncomingAssetsTable,
  createIncomingAsset,
  updateIncomingAssetStatus,
  getAllIncomingAssets,
  getIncomingAssetById,
  getTotalIncomingAssets,
  deleteIncomingAsset,
  getIncomingAssetsByStatus,
  getRecentIncomingAssets,
};
