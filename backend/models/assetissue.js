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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create the issue
      const issueQuery = `
        INSERT INTO asset_issues 
        (asset_id, issue_type, description, priority, reported_by, user_picture)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const issueValues = [
        issueData.asset_id,
        issueData.issue_type,
        issueData.description,
        issueData.priority,
        issueData.reported_by,
        issueData.user_picture
      ];

      const issueResult = await client.query(issueQuery, issueValues);

      // Update the asset's has_issue status
      const updateAssetQuery = `
        UPDATE assets 
        SET has_issue = true 
        WHERE asset_id = $1
      `;
      await client.query(updateAssetQuery, [issueData.asset_id]);

      await client.query('COMMIT');
      return issueResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in createIssue:', error);
      throw error;
    } finally {
      client.release();
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

  getIssueLogsByAsset: async (assetId) => {
    const query = `
      SELECT * FROM asset_issues 
      WHERE asset_id = $1 
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [assetId]);
    return rows;
  },

  getIssueHistory: async () => {
    try {
      console.log('Executing getIssueHistory query...');
      const query = `
        SELECT 
          ai.*,
          a."assetName" as asset_name
        FROM asset_issues ai
        LEFT JOIN assets a ON ai.asset_id = a.asset_id
        ORDER BY 
          CASE 
            WHEN ai.status = 'Pending' THEN 1
            WHEN ai.status = 'In Progress' THEN 2
            WHEN ai.status = 'In Repair' THEN 3
            WHEN ai.status = 'Resolved' THEN 4
            ELSE 5
          END,
          ai.created_at DESC
      `;
      const { rows } = await pool.query(query);
      console.log('Query results:', rows);
      return rows;
    } catch (error) {
      console.error('Database error in getIssueHistory:', error);
      throw error;
    }
  },
};

module.exports = AssetIssue;
