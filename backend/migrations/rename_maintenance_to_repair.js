const pool = require('../config/database');

async function renameTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // First, create repair_records table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS repair_records (
        id SERIAL PRIMARY KEY,
        asset_id VARCHAR(20) REFERENCES Assets(asset_id),
        repair_type VARCHAR(50) NOT NULL,
        description TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cost DECIMAL(10,2),
        performed_by VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Pending',
        fixed_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Update assets table to ensure under_repair column exists
    await client.query(`
      ALTER TABLE assets 
      ADD COLUMN IF NOT EXISTS under_repair BOOLEAN DEFAULT false
    `);

    // Update any existing records in repair_records
    await client.query(`
      UPDATE repair_records 
      SET status = 'In Repair' 
      WHERE status = 'In Maintenance'
    `);

    // Update any foreign key constraints if they exist
    await client.query(`
      DO $$ 
      BEGIN 
        IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'asset_issues' 
          AND column_name = 'maintenance_id'
        ) THEN
          ALTER TABLE asset_issues 
          RENAME COLUMN maintenance_id TO repair_id;
        END IF;
      END $$;
    `);

    await client.query('COMMIT');
    console.log('Successfully created repair tables and updated columns');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

renameTables().catch(console.error); 