const pool = require('../config/database');

// List of all tables in your system
const tables = [
  'Users',
  'terms_and_conditions',
  'SupplierActivityLogs',
  'suppliers',
  'Role',
  'outgoing_assets',
  'notification_settings',
  'Locations',
  'Categories',
  'Events',
  'event_assets',
  'borrow_logs',
  'borrowing_requests',
  'borrowed_assets',
  'Assets',
  'AssetActivityLogs',
  'asset_issues',
  'repair_records',
  'maintenance_records'
];

async function truncateAllTables() {
  const client = await pool.connect();
  
  try {
    console.log('Starting to truncate all tables...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Disable foreign key constraints temporarily
    console.log('Disabling foreign key constraints...');
    await client.query('SET session_replication_role = replica;');
    
    // Truncate each table
    for (const table of tables) {
      try {
        console.log(`Truncating table: ${table}`);
        await client.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
        console.log(`✓ Successfully truncated: ${table}`);
      } catch (error) {
        // If table doesn't exist, log but continue
        if (error.code === '42P01') {
          console.log(`⚠️ Table does not exist: ${table}`);
        } else {
          console.error(`❌ Error truncating ${table}:`, error.message);
          throw error;
        }
      }
    }
    
    // Re-enable foreign key constraints
    console.log('Re-enabling foreign key constraints...');
    await client.query('SET session_replication_role = DEFAULT;');
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('🎉 All tables have been successfully truncated!');
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Error during truncation process:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Alternative method using dynamic table discovery
async function truncateAllTablesFromDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Discovering all tables from database...');
    
    // Get all table names from the database
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `);
    
    const discoveredTables = result.rows.map(row => row.tablename);
    console.log('Discovered tables:', discoveredTables);
    
    if (discoveredTables.length === 0) {
      console.log('No tables found to truncate.');
      return;
    }
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Disable foreign key constraints
    console.log('Disabling foreign key constraints...');
    await client.query('SET session_replication_role = replica;');
    
    // Truncate each discovered table
    for (const table of discoveredTables) {
      try {
        console.log(`Truncating table: ${table}`);
        await client.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
        console.log(`✓ Successfully truncated: ${table}`);
      } catch (error) {
        console.error(`❌ Error truncating ${table}:`, error.message);
        throw error;
      }
    }
    
    // Re-enable foreign key constraints
    console.log('Re-enabling foreign key constraints...');
    await client.query('SET session_replication_role = DEFAULT;');
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('🎉 All tables have been successfully truncated!');
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Error during truncation process:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Export functions for use in other scripts
module.exports = {
  truncateAllTables,
  truncateAllTablesFromDatabase,
  tables
};

// If this script is run directly, execute the truncation
if (require.main === module) {
  console.log('Choose truncation method:');
  console.log('1. Use predefined table list');
  console.log('2. Discover tables from database automatically');
  
  // Get command line argument or default to method 1
  const method = process.argv[2] || '1';
  
  if (method === '2') {
    truncateAllTablesFromDatabase()
      .then(() => {
        console.log('Truncation completed successfully!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Truncation failed:', error);
        process.exit(1);
      });
  } else {
    truncateAllTables()
      .then(() => {
        console.log('Truncation completed successfully!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Truncation failed:', error);
        process.exit(1);
      });
  }
} 