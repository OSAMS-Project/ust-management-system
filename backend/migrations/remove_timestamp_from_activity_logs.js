const pool = require('../config/database');

async function removeTimestampFromActivityLogs() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Remove timestamp column if it exists
    await client.query(`
      ALTER TABLE AssetActivityLogs 
      DROP COLUMN IF EXISTS timestamp
    `);

    await client.query('COMMIT');
    console.log('Successfully removed timestamp column from AssetActivityLogs');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing timestamp column:', error);
    throw error;
  } finally {
    client.release();
  }
}

removeTimestampFromActivityLogs().catch(console.error); 