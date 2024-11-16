const pool = require('../config/database');

async function addUserInfoToAssets() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add new columns if they don't exist
    await client.query(`
      ALTER TABLE Assets 
      ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS user_picture TEXT
    `);

    // Update existing records to have a default user_name
    await client.query(`
      UPDATE Assets 
      SET user_name = added_by 
      WHERE user_name IS NULL
    `);

    await client.query('COMMIT');
    console.log('Successfully added user info columns to Assets table');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding user info columns:', error);
    throw error;
  } finally {
    client.release();
  }
}

addUserInfoToAssets().catch(console.error); 