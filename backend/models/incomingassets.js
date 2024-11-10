const pool = require('../config/database');
const { executeTransaction } = require('../utils/queryExecutor');

const IncomingAssets = {
  createIncomingAssetsTable: async () => {
    try {
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
      await pool.query(query);
      console.log('Incoming assets table created successfully');
    } catch (error) {
      console.error('Error creating incoming assets table:', error);
      throw error;
    }
  },

  createIncomingAsset: async (assetData) => {
    const { 
      assetName, 
      description, 
      type, 
      category, 
      cost, 
      quantity, 
      total_cost, 
      expected_date, 
      notes 
    } = assetData;

    try {
      const queries = [{
        query: `
          INSERT INTO incoming_assets 
          ("assetName", description, type, category, cost, quantity, total_cost, expected_date, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `,
        params: [assetName, description, type, category, cost, quantity, total_cost, expected_date, notes]
      }];

      const result = await executeTransaction(queries);
      return result[0]; // Return the first (and only) result
    } catch (error) {
      console.error('Error creating incoming asset:', error);
      throw error;
    }
  },

  getAllIncomingAssets: async () => {
    try {
      const result = await pool.query('SELECT * FROM incoming_assets ORDER BY created_at DESC');
      return result.rows;
    } catch (error) {
      console.error('Error getting incoming assets:', error);
      throw error;
    }
  },

  updateIncomingAssetStatus: async (id, status, location) => {
    try {
      const queries = [{
        query: `
          UPDATE incoming_assets 
          SET status = $1, 
              location = $2,
              updated_at = CURRENT_TIMESTAMP 
          WHERE id = $3 
          RETURNING *
        `,
        params: [status, location, id]
      }];

      const result = await executeTransaction(queries);
      return result[0];
    } catch (error) {
      console.error('Error updating incoming asset status:', error);
      throw error;
    }
  }
};

module.exports = IncomingAssets;
