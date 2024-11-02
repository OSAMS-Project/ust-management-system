const pool = require('../config/database');

const AssetRequest = {
  getAssetRequest: async () => {
    try {
      const query = 'SELECT * FROM asset_request ORDER BY created_at DESC';
      const { rows } = await pool.query(query);
      console.log('Database rows:', rows);
      return rows;
    } catch (error) {
      console.error('Error in getAssetRequest:', error);
      throw error;
    }
  },

  addAssetRequest: async (assetData) => {
    console.log('Adding asset request:', assetData);
    const { assetName, quantity, created_by, user_picture } = assetData;
    console.log('Created by:', created_by);
    const query = `
      INSERT INTO asset_request (asset_name, quantity, created_by, user_picture)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [assetName, quantity, created_by, user_picture];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  updateAssetRequest: async (id, assetData) => {
    const { asset_name, quantity, expected_arrival, supplier_id } = assetData;
    const query = `
      UPDATE asset_request
      SET asset_name = $1, quantity = $2, expected_arrival = $3, supplier_id = $4
      WHERE id = $5
      RETURNING *
    `;
    const values = [asset_name, quantity, expected_arrival, supplier_id, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  deleteAssetRequest: async (id) => {
    const query = 'DELETE FROM asset_request WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  createAssetRequestTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS asset_request (
        id SERIAL PRIMARY KEY,
        asset_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        supplier_id VARCHAR(255),
        created_by VARCHAR(255),
        user_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    try {
      await pool.query(query);
      console.log('asset_request table created successfully');
    } catch (error) {
      console.error('Error creating asset_request table:', error);
      throw error;
    }
  },
};

module.exports = AssetRequest;
