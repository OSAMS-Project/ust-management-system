const pool = require('../config/database');

const getAssetRequest = async () => {
  try {
    await createAssetRequestTable();
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
};

const getApprovedRequests = async () => {
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
};

const getDeclinedRequests = async () => {
  try {
    const query = `
      SELECT * FROM asset_request 
      WHERE status = 'declined' 
      ORDER BY declined_at DESC NULLS LAST
    `;
    const { rows } = await pool.query(query);
    console.log('Fetched declined requests:', rows);
    return rows;
  } catch (error) {
    console.error('Error in getDeclinedRequests:', error);
    throw error;
  }
};

const addAssetRequest = async (assetData) => {
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
};

const updateAssetRequest = async (id, assetData) => {
  try {
    console.log('Updating asset request:', { id, assetData });
    
    const setClause = [];
    const values = [];
    let paramCount = 1;

    if (assetData.status) {
      setClause.push(`status = $${paramCount}`);
      values.push(assetData.status);
      paramCount++;

      if (assetData.status === 'approved') {
        setClause.push(`approved_at = CURRENT_TIMESTAMP`);
      } else if (assetData.status === 'declined') {
        setClause.push(`declined_at = CURRENT_TIMESTAMP`);
      }
    }

    if (assetData.auto_declined !== undefined) {
      setClause.push(`auto_declined = $${paramCount}`);
      values.push(assetData.auto_declined);
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
};

const deleteAssetRequest = async (id) => {
  const query = 'DELETE FROM asset_request WHERE id = $1 RETURNING *';
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

const createAssetRequestTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS asset_request (
      id SERIAL PRIMARY KEY,
      asset_name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL,
      comments TEXT,
      created_by VARCHAR(255),
      user_picture TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approved_at TIMESTAMP,
      declined_at TIMESTAMP,
      archived_at TIMESTAMP,
      original_status VARCHAR(50),
      auto_declined BOOLEAN DEFAULT FALSE
    )
  `;
  try {
    await pool.query(query);
    console.log('asset_request table created successfully');
  } catch (error) {
    console.error('Error creating asset_request table:', error);
    throw error;
  }
};

const getArchivedRequests = async () => {
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
};

const archiveRequest = async (id) => {
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
};

const restoreRequest = async (id) => {
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
};

// Exporting all methods as individual constants
module.exports = {
  getAssetRequest,
  getApprovedRequests,
  getDeclinedRequests,
  addAssetRequest,
  updateAssetRequest,
  deleteAssetRequest,
  createAssetRequestTable,
  getArchivedRequests,
  archiveRequest,
  restoreRequest
};
