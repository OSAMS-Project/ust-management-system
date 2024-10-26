const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const SSE = require('express-sse');
const assetRoutes = require('./routes/assetRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const locationRoutes = require('./routes/locationRoutes');
const Asset = require('./models/assets');
const Event = require('./models/events');
const User = require('./models/user');
const Category = require('./models/category');
const Location = require('./models/location');
const Supplier = require('./models/supplier');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const assetActivityLogRoutes = require('./routes/assetactivitylogRoutes');
const dashboardInfoCardsRoutes = require('./routes/dashboardinfocardsRoutes');
const borrowingRequestRoutes = require('./routes/borrowingrequestRoutes');
const borrowLogsRoutes = require('./routes/borrowLogsRoutes');
const incomingAssetRoutes = require('./routes/incomingAssetRoutes');
const IncomingAsset = require('./models/incomingassets');
const maintenanceRoutes = require('./routes/MaintenanceRoutes');
const Maintenance = require('./models/Maintenance');

const { createEventsTable, createEventAssetsTable } = require('./models/events');

const app = express();
const sse = new SSE();
app.set('sse', sse);

app.use(cors());
app.use(bodyParser.json()); // Use body-parser middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Use routes
app.use('/api/assets', assetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/events', eventRoutes); // Use the event routes
app.use('/api/users', userRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/asset-activity-logs', assetActivityLogRoutes);
app.use('/api/dashboard', dashboardInfoCardsRoutes);
app.use('/api/borrowing-requests', borrowingRequestRoutes);
app.use('/api/borrow-logs', borrowLogsRoutes);
app.use('/api/incoming-assets', incomingAssetRoutes);
app.use('/api/Maintenance', maintenanceRoutes);


// SSE endpoint
app.get('/api/assets/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  sse.init(req, res);
});

// Update asset quantity
app.put('/api/assets/updateQuantity/:assetId', async (req, res) => {
  try {
    const { assetId } = req.params;
    const { quantity } = req.body;
    
    // Update the asset quantity in your database
    await Asset.updateQuantity(assetId, quantity);

    // Notify all clients about the quantity update
    sse.send({
      type: 'assetQuantityUpdate',
      assetId: assetId,
      newQuantity: quantity
    }, 'assetUpdate');

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating asset quantity:', error);
    res.status(500).json({ error: 'Failed to update asset quantity' });
  }
});

// Add assets to event
app.post('/api/events/:eventId/addAssets', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { assets } = req.body;

    console.log(`Received request to add assets to event ${eventId}:`, assets);

    await Event.addAssetsToEvent(eventId, assets);

    for (const asset of assets) {
      const newQuantity = asset.quantity - asset.selectedQuantity;
      console.log(`Updating asset ${asset.asset_id} quantity. Old: ${asset.quantity}, New: ${newQuantity}`);
      await Asset.updateQuantity(asset.asset_id, newQuantity);

      sse.send({
        type: 'assetQuantityUpdate',
        assetId: asset.asset_id,
        newQuantity: newQuantity
      }, 'assetUpdate');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding assets to event:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to add assets to event', details: error.message });
  }
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await Asset.readAssets();
    res.json({ message: 'Database connection successful', result });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('API endpoints:');
  console.log('  - GET    /api/assets');
  console.log('  - POST   /api/assets');
  console.log('  - PUT    /api/assets/:id');
  console.log('  - DELETE /api/assets/:id');
  console.log('  - GET    /api/categories');
  console.log('  - POST   /api/categories');
  console.log('  - DELETE /api/categories/:categoryName');
  console.log('  - GET    /api/locations');
  console.log('  - POST   /api/locations');
  console.log('  - DELETE /api/locations/:locationName');
  console.log('  - GET    /api/events');
  console.log('  - POST   /api/events');
  console.log('  - PUT    /api/events/:uniqueId');
  console.log('  - DELETE /api/events/delete/:uniqueId');
  console.log('  - GET    /api/users');
  console.log('  - POST   /api/users');
  console.log('  - PUT    /api/users/:id');
  console.log('  - DELETE /api/users/:id');
  console.log('  - GET    /api/suppliers');
  console.log('  - POST   /api/suppliers');
  console.log('  - DELETE /api/suppliers/:supplierName');
  console.log('  - GET    /api/asset-activity-logs');
  console.log('  - POST   /api/asset-activity-logs');
  console.log('  - GET    /api/dashboard');
  console.log('  - GET    /api/borrowing-requests');
  console.log('  - POST   /api/borrowing-requests');
  console.log('  - PUT    /api/borrowing-requests/:id');
  console.log('  - DELETE /api/borrowing-requests/:id');
  console.log('  - GET    /api/borrow-logs');
  console.log('  - POST   /api/borrow-logs');
  console.log('  - GET    /api/assets/sse');
  console.log('  - PUT    /api/assets/updateQuantity/:assetId');
  console.log('  - POST   /api/events/:eventId/addAssets');
  console.log('  - POST   /api/events/:eventId/removeAsset');
  console.log('  - POST   /api/events/:eventId/updateAssetQuantity');
  console.log('  - DELETE /api/Events/delete/:eventId');
  initializeTables();
});

const initializeTables = async () => {
  try {
    console.log('Starting table initialization...');
    await createEventsTable();
    console.log('Events table initialized');
    await User.createUserTable();
    console.log('Users table initialized');
    await Location.createLocationsTable();
    console.log('Locations table initialized');
    await Category.createCategoriesTable();
    console.log('Categories table initialized');
    await Asset.createAssetsTable();  
    console.log('Assets table initialized');
    await Supplier.createSuppliersTable();
    console.log('Suppliers table initialized');
    await createEventAssetsTable();
    console.log('Event assets table initialized');
    await Maintenance.createMaintenanceTable();
    console.log('Maintenance table initialized');
    console.log('All tables initialized successfully');
  } catch (err) {
    console.error('Error initializing tables:', err);
  }
};

(async () => {
  try {
    await Event.addIsCompletedColumn();
    initializeTables();
  } catch (error) {
    console.error('Error during setup:', error);
  }
})();

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!res.headersSent) {
    res.status(500).send('Something broke!');
  }
});

const pool = require('./config/database');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database', err);
  } else {
    console.log('Connected to the database');
  }
});

app.post('/api/events/:eventId/removeAsset', async (req, res) => {
  const client = await pool.connect();
  try {
    const { eventId } = req.params;
    const { assetId, quantity } = req.body;
    await client.query('BEGIN');
    // 1. Remove the asset from the event
    const removeAssetQuery = `
      DELETE FROM event_assets
      WHERE event_id = $1 AND asset_id = $2
      RETURNING quantity
    `;
    const removeResult = await client.query(removeAssetQuery, [eventId, assetId]);
    if (removeResult.rows.length === 0) {
      throw new Error('Asset not found in the event');
    }
    const removedQuantity = removeResult.rows[0].quantity;
    // 2. Update the asset's quantity in the main asset table
    const updateAssetQuery = `
      UPDATE assets
      SET quantity = quantity + $1
      WHERE asset_id = $2
      RETURNING quantity
    `;
    const updateResult = await client.query(updateAssetQuery, [removedQuantity, assetId]);
    if (updateResult.rows.length === 0) {
      throw new Error('Asset not found');
    }
    const updatedAssetQuantity = updateResult.rows[0].quantity;
    await client.query('COMMIT');
    // 3. Send a success response
    res.json({ 
      success: true, 
      message: 'Asset removed successfully', 
      updatedAssetQuantity: updatedAssetQuantity 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing asset from event:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.delete('/api/Events/delete/:eventId', async (req, res) => {
  const client = await pool.connect();
  try {
    const { eventId } = req.params;
    await client.query('BEGIN');
    // Delete the event assets first
    const deleteAssetsResult = await client.query('DELETE FROM event_assets WHERE event_id = $1', [eventId]);
    console.log(`Deleted ${deleteAssetsResult.rowCount} event assets`);
    // Then delete the event
    const deleteEventQuery = 'DELETE FROM events WHERE unique_id = $1 RETURNING *';
    const result = await client.query(deleteEventQuery, [eventId]);
    if (result.rows.length === 0) {
      throw new Error('Event not found');
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Event deleted successfully', deletedEvent: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting event:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message, stack: error.stack });
  } finally {
    client.release();
  }
});

// Add this line to create the table when the server starts
IncomingAsset.createIncomingAssetsTable();

