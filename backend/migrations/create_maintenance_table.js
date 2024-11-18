const pool = require('../config/database');

async function createMaintenanceTable() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create maintenance_records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS maintenance_records (
        id SERIAL PRIMARY KEY,
        asset_id VARCHAR(20) REFERENCES Assets(asset_id),
        maintenance_type VARCHAR(50) NOT NULL,
        description TEXT,
        scheduled_date TIMESTAMP NOT NULL,
        completion_date TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Scheduled',
        priority VARCHAR(20) NOT NULL,
        performed_by VARCHAR(255),
        maintenance_cost DECIMAL(10,2),
        technician_notes TEXT,
        maintenance_quantity INTEGER DEFAULT 1,
        scheduled_by VARCHAR(255),
        user_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('Successfully created maintenance_records table');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating maintenance_records table:', error);
    throw error;
  } finally {
    client.release();
  }
}

createMaintenanceTable().catch(console.error); 