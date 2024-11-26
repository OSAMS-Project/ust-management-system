require('dotenv').config({ path: '../.env' });
const pool = require('../config/database');

async function updateBorrowingRequestDates() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Alter the date columns to TIMESTAMP
    await client.query(`
      ALTER TABLE borrowing_requests 
      ALTER COLUMN date_to_be_collected TYPE TIMESTAMP USING date_to_be_collected::TIMESTAMP,
      ALTER COLUMN expected_return_date TYPE TIMESTAMP USING expected_return_date::TIMESTAMP
    `);

    await client.query('COMMIT');
    console.log('Successfully updated date columns to TIMESTAMP');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating date columns:', error);
    throw error;
  } finally {
    client.release();
  }
}

updateBorrowingRequestDates().catch(console.error);
