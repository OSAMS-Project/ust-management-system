const pool = require('../config/database');

async function fixActivityAndBorrowLogsTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Drop and recreate AssetActivityLogs table
    console.log('Dropping AssetActivityLogs table...');
    await client.query(`DROP TABLE IF EXISTS AssetActivityLogs CASCADE`);
    
    console.log('Creating AssetActivityLogs table with correct structure...');
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

    // Drop and recreate borrow_logs table
    console.log('Dropping borrow_logs table...');
    await client.query(`DROP TABLE IF EXISTS borrow_logs CASCADE`);
    
    console.log('Creating borrow_logs table with correct structure...');
    await client.query(`
      CREATE TABLE borrow_logs (
        id SERIAL PRIMARY KEY,
        asset_id VARCHAR(20) REFERENCES Assets(asset_id),
        borrower_name VARCHAR(255),
        borrower_email VARCHAR(255),
        borrower_department VARCHAR(255),
        quantity_borrowed INTEGER,
        date_borrowed TIMESTAMP,
        date_returned TIMESTAMP,
        borrowing_request_id INTEGER REFERENCES borrowing_requests(id)
      )
    `);

    await client.query('COMMIT');
    console.log('Successfully recreated AssetActivityLogs and borrow_logs tables');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error fixing tables:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

fixActivityAndBorrowLogsTables();
