const pool = require('../config/database');

async function addCreatedAtToActivityLogs() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add created_at column if it doesn't exist
    await client.query(`
      ALTER TABLE AssetActivityLogs 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    // Update existing records to have current timestamp
    await client.query(`
      UPDATE AssetActivityLogs 
      SET created_at = CURRENT_TIMESTAMP 
      WHERE created_at IS NULL
    `);

    await client.query('COMMIT');
    console.log('Successfully added created_at column to AssetActivityLogs');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding created_at column:', error);
    throw error;
  } finally {
    client.release();
  }
}

addCreatedAtToActivityLogs().catch(console.error); 