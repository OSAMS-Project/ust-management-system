const pool = require('../config/database');

const AssetRequest = {
  getAssetRequest: async () => {
    try {
      const query = `
        SELECT * FROM asset_request 
        WHERE status = 'pending' 
        ORDER BY created_at DESC
      `;
      const { rows } = await pool.query(query);
      console.log('Database rows:', rows);
      return rows;
    } catch (error) {
      console.error('Error in getAssetRequest:', error);
      throw error;
    }
  },

  getApprovedRequests: async () => {
    try {
      const query = `
        SELECT * FROM asset_request 
        WHERE status = 'approved' 
        ORDER BY created_at DESC
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error in getApprovedRequests:', error);
      throw error;
    }
  },

  getDeclinedRequests: async () => {
    try {
      const query = `
        SELECT * FROM asset_request 
        WHERE status = 'declined' 
        ORDER BY created_at DESC
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error in getDeclinedRequests:', error);
      throw error;
    }
  },

  addAssetRequest: async (assetData) => {
    console.log('Adding asset request:', assetData);
    const { assetName, quantity, comments, created_by, user_picture } = assetData;
    console.log('Created by:', created_by);
    const query = `
      INSERT INTO asset_request (asset_name, quantity, comments, created_by, user_picture)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [assetName, quantity, comments, created_by, user_picture];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  updateAssetRequest: async (id, assetData) => {
    try {
      const setClause = [];
      const values = [];
      let paramCount = 1;

      if (assetData.status === 'approved') {
        setClause.push(`approved_at = CURRENT_TIMESTAMP`);
      } else if (assetData.status === 'declined') {
        setClause.push(`declined_at = CURRENT_TIMESTAMP`);
      }
      
      if (assetData.status !== undefined) {
        setClause.push(`status = $${paramCount}`);
        values.push(assetData.status);
        paramCount++;
      }

      values.push(id);

      const query = `
        UPDATE asset_request
        SET ${setClause.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error in updateAssetRequest:', error);
      throw error;
    }
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
        created_by VARCHAR(255),
        user_picture TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP,
        declined_at TIMESTAMP
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

  getArchivedRequests: async () => {
    try {
      const query = `
        SELECT * FROM asset_request 
        WHERE status = 'archived' 
        ORDER BY archived_at DESC
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error in getArchivedRequests:', error);
      throw error;
    }
  },

  archiveRequest: async (id) => {
    try {
      const query = `
        UPDATE asset_request
        SET status = 'archived',
            archived_at = CURRENT_TIMESTAMP,
            original_status = status
        WHERE id = $1
        RETURNING *
      `;
      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error in archiveRequest:', error);
      throw error;
    }
  },

  restoreRequest: async (id) => {
    try {
      const query = `
        UPDATE asset_request
        SET status = original_status,
            archived_at = NULL
        WHERE id = $1
        RETURNING *
      `;
      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error('Error in restoreRequest:', error);
      throw error;
    }
  }
};

module.exports = AssetRequest;
