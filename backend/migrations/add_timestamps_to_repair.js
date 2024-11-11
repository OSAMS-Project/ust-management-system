const pool = require('../config/database');

async function addTimestampsToRepair() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Add missing columns if they don't exist
    await client.query(`
      ALTER TABLE repair_records 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);

    await client.query('COMMIT');
    console.log('Successfully added timestamp columns to repair_records');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding timestamp columns:', error);
    throw error;
  } finally {
    client.release();
  }
}

addTimestampsToRepair().catch(console.error); 