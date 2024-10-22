const pool = require('../config/database');

const IncomingAsset = {
  getAllIncomingAssets: async () => {
    const query = 'SELECT * FROM incoming_assets ORDER BY expected_arrival DESC';
    const { rows } = await pool.query(query);
    return rows;
  },

  addIncomingAsset: async (assetData) => {
    console.log('Adding incoming asset:', assetData);
    const { assetName, quantity, expectedArrival, created_by, user_picture } = assetData;
    console.log('Created by:', created_by);
    const query = `
      INSERT INTO incoming_assets (asset_name, quantity, expected_arrival, created_by, user_picture)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [assetName, quantity, expectedArrival, created_by, user_picture];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  updateIncomingAsset: async (id, assetData) => {
    const { asset_name, quantity, expected_arrival, supplier_id } = assetData;
    const query = `
      UPDATE incoming_assets
      SET asset_name = $1, quantity = $2, expected_arrival = $3, supplier_id = $4
      WHERE id = $5
      RETURNING *
    `;
    const values = [asset_name, quantity, expected_arrival, supplier_id, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  deleteIncomingAsset: async (id) => {
    const query = 'DELETE FROM incoming_assets WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  createIncomingAssetsTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS incoming_assets (
        id SERIAL PRIMARY KEY,
        asset_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        expected_arrival DATE NOT NULL,
        supplier_id VARCHAR(255),
        created_by VARCHAR(255),
        user_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    try {
      await pool.query(query);
      console.log('incoming_assets table created successfully');
    } catch (error) {
      console.error('Error creating incoming_assets table:', error);
      throw error;
    }
  },
};

module.exports = IncomingAsset;
