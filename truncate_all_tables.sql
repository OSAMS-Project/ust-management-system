-- SQL Script to Truncate All Tables in PostgreSQL Database
-- Run this directly in pgAdmin Query Tool

-- Method 1: Manual list of your specific tables (Updated with correct case handling)
DO $$
DECLARE
    table_names text[] := ARRAY[
        'users',              -- PostgreSQL stores as lowercase
        'terms_and_conditions', 
        'supplieractivitylogs',
        'suppliers',
        'role',
        'outgoing_assets',
        'notification_settings',
        'locations',
        'categories',
        'events',
        'event_assets',
        'borrow_logs',
        'borrowing_requests',
        'borrowed_assets',
        'assets',             -- This is the key one - PostgreSQL treats unquoted as lowercase
        'assetactivitylogs',
        'asset_issues',
        'repair_records',
        'maintenance_records'
    ];
    table_name text;
BEGIN
    -- Disable foreign key constraints temporarily
    SET session_replication_role = replica;
    
    RAISE NOTICE 'Starting truncation of all tables...';
    
    -- First, truncate tables that have foreign key dependencies in correct order
    -- Truncate child tables first, then parent tables
    
    -- Child tables first (they reference assets)
    FOREACH table_name IN ARRAY ARRAY[
        'outgoing_assets',
        'event_assets', 
        'borrow_logs',
        'borrowed_assets',
        'assetactivitylogs',
        'asset_issues',
        'repair_records',
        'maintenance_records'
    ]
    LOOP
        BEGIN
            EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', table_name);
            RAISE NOTICE 'Successfully truncated table: %', table_name;
        EXCEPTION WHEN undefined_table THEN
            RAISE NOTICE 'Table does not exist: %', table_name;
        WHEN OTHERS THEN
            RAISE NOTICE 'Error truncating %: %', table_name, SQLERRM;
        END;
    END LOOP;
    
    -- Now truncate the main tables
    FOREACH table_name IN ARRAY ARRAY[
        'assets',             -- Main assets table
        'borrowing_requests',
        'events',
        'users',
        'suppliers',
        'supplieractivitylogs',
        'role',
        'notification_settings',
        'locations',
        'categories',
        'terms_and_conditions'
    ]
    LOOP
        BEGIN
            EXECUTE format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', table_name);
            RAISE NOTICE 'Successfully truncated table: %', table_name;
        EXCEPTION WHEN undefined_table THEN
            RAISE NOTICE 'Table does not exist: %', table_name;
        WHEN OTHERS THEN
            RAISE NOTICE 'Error truncating %: %', table_name, SQLERRM;
        END;
    END LOOP;
    
    -- Re-enable foreign key constraints
    SET session_replication_role = DEFAULT;
    
    RAISE NOTICE 'All tables have been truncated successfully!';
END $$;

-- ============================================================================
-- Method 2: Dynamic - Automatically discover and truncate all user tables
-- Uncomment the code below if you prefer automatic table discovery
-- ============================================================================

/*
DO $$
DECLARE
    table_record RECORD;
    sql_statement TEXT;
BEGIN
    -- Disable foreign key constraints temporarily
    SET session_replication_role = replica;
    
    -- Get all user tables (excluding system tables)
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    LOOP
        -- Build and execute truncate statement for each table
        sql_statement := format('TRUNCATE TABLE %I RESTART IDENTITY CASCADE', table_record.tablename);
        EXECUTE sql_statement;
        RAISE NOTICE 'Truncated table: %', table_record.tablename;
    END LOOP;
    
    -- Re-enable foreign key constraints
    SET session_replication_role = DEFAULT;
    
    RAISE NOTICE 'All tables have been truncated successfully!';
END $$;
*/

-- ============================================================================
-- Method 3: Direct ASSETS table truncation (if only assets table has issues)
-- ============================================================================

/*
-- If only the assets table is giving trouble, run this specific command:
SET session_replication_role = replica;
TRUNCATE TABLE assets RESTART IDENTITY CASCADE;
SET session_replication_role = DEFAULT;

-- Or try with quoted name if needed:
SET session_replication_role = replica;
TRUNCATE TABLE "Assets" RESTART IDENTITY CASCADE;
SET session_replication_role = DEFAULT;
*/

-- ============================================================================
-- Method 4: Generate TRUNCATE statements (for review before execution)
-- This will show you the commands without executing them
-- ============================================================================

/*
SELECT 'TRUNCATE TABLE ' || quote_ident(tablename) || ' RESTART IDENTITY CASCADE;' as truncate_commands
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE 'sql_%'
ORDER BY tablename;
*/ 