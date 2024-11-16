const pool = require('../config/database');

async function addUserInfoToActivityLogs() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add new columns if they don't exist
    await client.query(`
      ALTER TABLE AssetActivityLogs 
      ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS user_picture TEXT
    `);

    // Update existing records to have a default user_name
    await client.query(`
      UPDATE AssetActivityLogs 
      SET user_name = 'Unknown User' 
      WHERE user_name IS NULL
    `);

    await client.query('COMMIT');
    console.log('Successfully added user info columns to AssetActivityLogs');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding user info columns:', error);
    throw error;
  } finally {
    client.release();
  }
}

addUserInfoToActivityLogs().catch(console.error); 