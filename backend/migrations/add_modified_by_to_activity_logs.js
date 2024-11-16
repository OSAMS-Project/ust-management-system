const pool = require('../config/database');

async function addModifiedByToActivityLogs() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Drop the existing table
    await client.query(`DROP TABLE IF EXISTS AssetActivityLogs`);

    // Recreate the table with all required columns including created_at
    await client.query(`
      CREATE TABLE AssetActivityLogs (
        id SERIAL PRIMARY KEY,
        asset_id VARCHAR(20) REFERENCES Assets(asset_id),
        action VARCHAR(50) NOT NULL,
        field_name VARCHAR(50),
        old_value TEXT,
        new_value TEXT,
        modified_by VARCHAR(255),
        user_picture TEXT,
        context TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('Successfully recreated AssetActivityLogs table with modified_by and created_at columns');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error recreating table:', error);
    throw error;
  } finally {
    client.release();
  }
}

addModifiedByToActivityLogs().catch(console.error); 