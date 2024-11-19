const pool = require('../config/database');

const createIssuesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS asset_issues (
      id SERIAL PRIMARY KEY,
      asset_id VARCHAR(255) REFERENCES assets(asset_id),
      issue_type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      priority VARCHAR(50) NOT NULL,
      quantity INTEGER DEFAULT 1,
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
};

const createIssue = async (issueData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // First check if asset has enough quantity
    const assetQuery = 'SELECT quantity FROM assets WHERE asset_id = $1';
    const assetResult = await client.query(assetQuery, [issueData.asset_id]);
    
    if (!assetResult.rows[0] || assetResult.rows[0].quantity < issueData.issue_quantity) {
      throw new Error('Insufficient asset quantity available');
    }

    // Update asset quantity
    const updateAssetQuery = `
      UPDATE assets 
      SET 
        quantity = quantity - $1,
        has_issue = true 
      WHERE asset_id = $2
      RETURNING quantity
    `;
    await client.query(updateAssetQuery, [issueData.issue_quantity, issueData.asset_id]);
    
    // Create the issue record
    const issueQuery = `
      INSERT INTO asset_issues 
      (asset_id, issue_type, description, priority, issue_quantity, reported_by, user_picture)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const issueValues = [
      issueData.asset_id,
      issueData.issue_type,
      issueData.description,
      issueData.priority,
      issueData.issue_quantity,
      issueData.reported_by,
      issueData.user_picture
    ];

    const issueResult = await client.query(issueQuery, issueValues);

    await client.query('COMMIT');
    return issueResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in createIssue:', error);
    throw error;
  } finally {
    client.release();
  }
};

const getAllIssues = async () => {
  const query = 'SELECT * FROM asset_issues ORDER BY created_at DESC';
  const result = await pool.query(query);
  return result.rows;
};

const updateIssueStatus = async (id, status) => {
  const query = `
    UPDATE asset_issues 
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

const deleteIssue = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // First get the issue details to know the quantity to restore
    const getIssueQuery = 'SELECT * FROM asset_issues WHERE id = $1';
    const issueResult = await client.query(getIssueQuery, [id]);
    const issue = issueResult.rows[0];

    if (!issue) {
      throw new Error('Issue not found');
    }

    // Restore the quantity to the asset
    const updateAssetQuery = `
      UPDATE assets 
      SET 
        quantity = quantity + $1,
        has_issue = EXISTS (
          SELECT 1 FROM asset_issues 
          WHERE asset_id = $2 AND id != $3 
          AND status NOT IN ('Resolved', 'In Repair')
        )
      WHERE asset_id = $2
      RETURNING *
    `;
    await client.query(updateAssetQuery, [
      issue.issue_quantity, 
      issue.asset_id,
      id
    ]);

    // Delete the issue
    const deleteQuery = 'DELETE FROM asset_issues WHERE id = $1 RETURNING *';
    const result = await client.query(deleteQuery, [id]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in deleteIssue:', error);
    throw error;
  } finally {
    client.release();
  }
};

const updateIssueStatusByAsset = async (assetId, status) => {
  const query = `
    UPDATE asset_issues 
    SET status = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE asset_id = $2 
    AND (status = 'In Repair' OR status = 'Pending')
    RETURNING *
  `;
  const values = [status, assetId];
  const { rows } = await pool.query(query, values);
  return rows;
};

const getIssueLogsByAsset = async (assetId) => {
  const query = `
    SELECT * FROM asset_issues 
    WHERE asset_id = $1 
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [assetId]);
  return rows;
};

const getIssueHistory = async () => {
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
};

const updateIssue = async (id, issueData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // If quantity is being updated, we need to handle asset quantity changes
    if (issueData.issue_quantity) {
      // Get the current issue
      const currentIssueQuery = 'SELECT * FROM asset_issues WHERE id = $1';
      const currentIssue = (await client.query(currentIssueQuery, [id])).rows[0];

      if (!currentIssue) {
        throw new Error('Issue not found');
      }

      // Calculate quantity difference
      const quantityDiff = issueData.issue_quantity - currentIssue.issue_quantity;

      // Update asset quantity if there's a difference
      if (quantityDiff !== 0) {
        const updateAssetQuery = `
          UPDATE assets 
          SET quantity = quantity - $1
          WHERE asset_id = $2
          RETURNING quantity
        `;
        await client.query(updateAssetQuery, [quantityDiff, currentIssue.asset_id]);
      }
    }

    // Update the issue record
    const updateIssueQuery = `
      UPDATE asset_issues 
      SET 
        issue_type = COALESCE($1, issue_type),
        description = COALESCE($2, description),
        priority = COALESCE($3, priority),
        issue_quantity = COALESCE($4, issue_quantity),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const updateValues = [
      issueData.issue_type,
      issueData.description,
      issueData.priority,
      issueData.issue_quantity,
      id
    ];

    const result = await client.query(updateIssueQuery, updateValues);
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in updateIssue:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Exporting all methods as individual constants
module.exports = {
  createIssuesTable,
  createIssue,
  getAllIssues,
  updateIssueStatus,
  deleteIssue,
  updateIssueStatusByAsset,
  getIssueLogsByAsset,
  getIssueHistory,
  updateIssue,
};
