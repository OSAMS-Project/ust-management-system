const pool = require("../config/database");
const { executeTransaction } = require("../utils/queryExecutor");

// Create the `incoming_assets` table
const createIncomingAssetsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS incoming_assets (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      asset_id VARCHAR(20),
      "assetName" VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL,
      category VARCHAR(100) NOT NULL,
      cost NUMERIC(10,2),
      quantity INTEGER,
      total_cost NUMERIC(10,2),
      expected_date TIMESTAMP WITH TIME ZONE,
      status VARCHAR(50) DEFAULT 'pending',
      location VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
  return pool.query(query);
};

// Add a new incoming asset
const createIncomingAsset = async (assetData) => {
  const query = `
    INSERT INTO incoming_assets 
    ("assetName", description, type, category, cost, quantity, total_cost, expected_date, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  const params = [
    assetData.assetName,
    assetData.description,
    assetData.type,
    assetData.category,
    assetData.cost,
    assetData.quantity,
    assetData.total_cost,
    assetData.expected_date,
    assetData.notes,
  ];

  const result = await executeTransaction([{ query, params }]);
  return result[0];
};

// Update the status of an incoming asset
const updateIncomingAssetStatus = async (id, status, location) => {
  const query = `
    UPDATE incoming_assets 
    SET status = $1, 
        location = $2,
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = $3 
    RETURNING *
  `;
  const params = [status, location, id];

  const result = await executeTransaction([{ query, params }]);
  return result[0];
};

// Get all incoming assets
const getAllIncomingAssets = async () => {
  try {
    const query = "SELECT * FROM incoming_assets ORDER BY created_at DESC";
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error fetching all incoming assets:", error);
    throw error;
  }
};

// Get the total number of incoming assets
const getTotalIncomingAssets = async () => {
  try {
    const query = "SELECT COUNT(*) AS total FROM incoming_assets";
    const result = await pool.query(query);
    return result.rows[0].total; // Return the total count
  } catch (error) {
    console.error("Error fetching total incoming assets:", error);
    throw error;
  }
};

// Export all functions
module.exports = {
  createIncomingAssetsTable,
  createIncomingAsset,
  updateIncomingAssetStatus,
  getAllIncomingAssets,
  getTotalIncomingAssets,
};
