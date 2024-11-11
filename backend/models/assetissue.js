const pool = require('../config/database');

const AssetIssue = {
  createIssuesTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS asset_issues (
        id SERIAL PRIMARY KEY,
        asset_id VARCHAR(255) REFERENCES assets(asset_id),
        issue_type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        reported_by VARCHAR(255),
        user_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    try {
      await pool.query(query);
      console.log('Asset issues table created successfully');
    } catch (error) {
      console.error('Error creating asset issues table:', error);
      throw error;
    }
  },

  createIssue: async (issueData) => {
    console.log('Received issue data:', issueData); // Add this for debugging
    
    const query = `
      INSERT INTO asset_issues 
      (asset_id, issue_type, description, priority, reported_by, user_picture)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      issueData.asset_id,
      issueData.issue_type,
      issueData.description,
      issueData.priority,
      issueData.reported_by,
      issueData.user_picture
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in createIssue:', error);
      console.error('Values being inserted:', values);
      throw error;
    }
  },

  getAllIssues: async () => {
    const query = 'SELECT * FROM asset_issues ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  },

  updateIssueStatus: async (id, status) => {
    const query = `
      UPDATE asset_issues 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  },

  deleteIssue: async (id) => {
    const query = 'DELETE FROM asset_issues WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  updateIssueStatusByAsset: async (assetId, status) => {
    const query = `
      UPDATE asset_issues 
      SET status = $1 
      WHERE asset_id = $2 AND status != 'Resolved'
      RETURNING *
    `;
    const values = [status, assetId];
    const { rows } = await pool.query(query, values);
    return rows;
  },
};

module.exports = AssetIssue;
