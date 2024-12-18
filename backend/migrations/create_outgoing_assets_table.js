const pool = require('../config/database');

async function createOutgoingAssetsTable() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create outgoing_assets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS outgoing_assets (
        id SERIAL PRIMARY KEY,
        asset_id VARCHAR(20) REFERENCES assets(asset_id),
        quantity INTEGER NOT NULL,
        reason TEXT,
        consumed_by VARCHAR(255),
        consumed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Consumed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('Successfully created outgoing_assets table');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating outgoing_assets table:', error);
    throw error;
  } finally {
    client.release();
  }
}

createOutgoingAssetsTable().catch(console.error); 