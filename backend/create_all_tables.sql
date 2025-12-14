-- USERS
CREATE TABLE IF NOT EXISTS Users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(255),
  picture VARCHAR(255),
  hd VARCHAR(255),
  access BOOLEAN DEFAULT FALSE,
  permissions JSON DEFAULT '[]'
);

-- ASSETS
CREATE TABLE IF NOT EXISTS Assets (
  asset_id VARCHAR(20) UNIQUE NOT NULL,
  "productCode" VARCHAR(50),
  "serialNumber" VARCHAR(50),
  "assetName" VARCHAR(255) NOT NULL,
  "assetDetails" TEXT,
  category VARCHAR(255),
  location VARCHAR(255),
  quantity BIGINT NOT NULL,
  "totalCost" DECIMAL(20, 2),
  cost DECIMAL(20, 2),
  image TEXT,
  type VARCHAR(50),
  "createdDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT FALSE,
  allocated_quantity BIGINT DEFAULT 0,
  "lastUpdated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  added_by VARCHAR(255),
  quantity_for_borrowing BIGINT DEFAULT 0,
  under_repair BOOLEAN DEFAULT false,
  has_issue BOOLEAN DEFAULT false,
  allow_borrowing BOOLEAN DEFAULT false
);

-- EVENTS
CREATE TABLE IF NOT EXISTS Events (
  unique_id VARCHAR(20) PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_start_time TIME NOT NULL,
  event_end_time TIME NOT NULL,
  event_location VARCHAR(255),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  completed_by VARCHAR(255),
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_assets JSONB
);

-- BORROWING REQUESTS
CREATE TABLE IF NOT EXISTS borrowing_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  purpose TEXT NOT NULL,
  contact_no VARCHAR(20) NOT NULL,
  cover_letter_url TEXT,
  selected_assets JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_to_be_collected TIMESTAMP,
  date_collected TIMESTAMP,
  expected_return_date TIMESTAMP,
  date_returned TIMESTAMP,
  notes TEXT
);

-- TERMS AND CONDITIONS
CREATE TABLE IF NOT EXISTS terms_and_conditions (
  id SERIAL PRIMARY KEY,
  borrowing_guidelines TEXT[],
  documentation_requirements TEXT[],
  usage_policy TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS Categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(255) UNIQUE NOT NULL
);

-- LOCATIONS
CREATE TABLE IF NOT EXISTS Locations (
  id SERIAL PRIMARY KEY,
  location_name VARCHAR(255) UNIQUE NOT NULL
);

-- SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  product VARCHAR(255) NOT NULL,
  streetAddress VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  contactNo VARCHAR(20) NOT NULL
);

-- ROLE
CREATE TABLE IF NOT EXISTS Role (
  id SERIAL PRIMARY KEY,
  role_name VARCHAR(255) UNIQUE NOT NULL,
  permissions JSON DEFAULT '[]'
);

-- NOTIFICATION SETTINGS
CREATE TABLE IF NOT EXISTS notification_settings (
  id SERIAL PRIMARY KEY,
  notification_email VARCHAR(255) NOT NULL,
  notifications_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ASSET ISSUES
CREATE TABLE IF NOT EXISTS asset_issues (
  id SERIAL PRIMARY KEY,
  asset_id VARCHAR(255) REFERENCES assets(asset_id),
  issue_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'Pending',
  reported_by VARCHAR(255),
  user_picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OUTGOING ASSETS
CREATE TABLE IF NOT EXISTS outgoing_assets (
  id SERIAL PRIMARY KEY,
  asset_id VARCHAR(20) REFERENCES assets(asset_id),
  quantity INTEGER NOT NULL,
  reason TEXT,
  consumed_by VARCHAR(255),
  consumed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Consumed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SUPPLIER ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS SupplierActivityLogs (
  id SERIAL PRIMARY KEY,
  supplier_id VARCHAR(20) REFERENCES Suppliers(supplier_id),
  action VARCHAR(50) NOT NULL,
  field_name VARCHAR(50),
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ASSET ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS AssetActivityLogs (
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
);

-- BORROW LOGS
CREATE TABLE IF NOT EXISTS borrow_logs (
  id SERIAL PRIMARY KEY,
  asset_id VARCHAR(20) REFERENCES Assets(asset_id),
  borrower_name VARCHAR(255),
  borrower_email VARCHAR(255),
  borrower_department VARCHAR(255),
  quantity_borrowed INTEGER,
  date_borrowed TIMESTAMP,
  date_returned TIMESTAMP,
  borrowing_request_id INTEGER REFERENCES borrowing_requests(id)
);