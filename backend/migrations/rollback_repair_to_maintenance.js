const pool = require('../config/database');

async function rollbackTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Rename repair table back to maintenance
    await client.query('ALTER TABLE repair_records RENAME TO maintenance_records');
    
    // Rename repair column back to maintenance in assets table
    await client.query(`
      ALTER TABLE assets 
      RENAME COLUMN under_repair TO under_maintenance
    `);

    // Rename repair_type column back to maintenance_type
    await client.query(`
      ALTER TABLE maintenance_records 
      RENAME COLUMN repair_type TO repair_type
    `);

    await client.query('COMMIT');
    console.log('Successfully rolled back repair to maintenance');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error rolling back tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

rollbackTables().catch(console.error); 