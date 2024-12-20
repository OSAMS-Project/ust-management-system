const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const SSE = require("express-sse");
const assetRoutes = require("./routes/assetRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const locationRoutes = require("./routes/locationRoutes");
const Asset = require("./models/assets");
const Event = require("./models/events");
const User = require("./models/user");
const Category = require("./models/category");
const Location = require("./models/location");
const Supplier = require("./models/supplier");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const assetActivityLogRoutes = require("./routes/assetactivitylogRoutes");
const dashboardInfoCardsRoutes = require("./routes/dashboardinfocardsRoutes");
const borrowingRequestRoutes = require("./routes/borrowingrequestRoutes");
const borrowLogsRoutes = require("./routes/borrowLogsRoutes");
const assetRequestRoutes = require("./routes/assetRequestRoutes");
const AssetRequest = require("./models/assetrequest");
const repairRoutes = require("./routes/RepairRoutes");
const roleRoutes = require("./routes/roleRoutes");
const AssetIssue = require("./models/assetissue");
const supplierActivityLogRoutes = require("./routes/supplierActivityLogRoutes");
const incomingAssetsRouter = require("./routes/incomingAssetsRoutes");
const IncomingAssets = require("./models/incomingassets");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const BorrowingRequest = require("./models/borrowingrequest");
const termsAndConditionsRoutes = require('./routes/termsandconditionsroutes');
const notificationRoutes = require("./routes/notificationRoutes");

const {
  createEventsTable,
  createEventAssetsTable,
} = require("./models/events");

const app = express();
const sse = new SSE();
app.set("sse", sse);

app.use(
  cors({
    origin: ['http://localhost:3000', 'https://osams.xyz'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Use routes
app.use("/api/assets", assetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/events", eventRoutes); // Use the event routes
app.use("/api/users", userRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/asset-activity-logs", assetActivityLogRoutes);
app.use("/api/dashboard", dashboardInfoCardsRoutes);
app.use("/api/borrowing-requests", borrowingRequestRoutes);
app.use("/api/borrow-logs", borrowLogsRoutes);
app.use("/api/asset-request", assetRequestRoutes);
app.use("/api/repair", repairRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/supplier-activity-logs", supplierActivityLogRoutes);
app.use("/api/incoming-assets", incomingAssetsRouter);
app.use("/api/maintenance", maintenanceRoutes);
app.use('/api/terms-and-conditions', termsAndConditionsRoutes);
app.use("/api/notification-settings", notificationRoutes);

// SSE endpoint
app.get("/api/assets/sse", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  sse.init(req, res);
});

// Update asset quantity
app.put("/api/assets/updateQuantity/:assetId", async (req, res) => {
  try {
    const { assetId } = req.params;
    const { quantity } = req.body;

    // Update the asset quantity in your database
    await Asset.updateQuantity(assetId, quantity);

    // Notify all clients about the quantity update
    sse.send(
      {
        type: "assetQuantityUpdate",
        assetId: assetId,
        newQuantity: quantity,
      },
      "assetUpdate"
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating asset quantity:", error);
    res.status(500).json({ error: "Failed to update asset quantity" });
  }
});

// Add assets to event
app.post("/api/events/:eventId/addAssets", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { assets } = req.body;

    console.log(`Received request to add assets to event ${eventId}:`, assets);

    await Event.addAssetsToEvent(eventId, assets);

    for (const asset of assets) {
      const newQuantity = asset.quantity - asset.selectedQuantity;
      console.log(
        `Updating asset ${asset.asset_id} quantity. Old: ${asset.quantity}, New: ${newQuantity}`
      );
      await Asset.updateQuantity(asset.asset_id, newQuantity);

      sse.send(
        {
          type: "assetQuantityUpdate",
          assetId: asset.asset_id,
          newQuantity: newQuantity,
        },
        "assetUpdate"
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding assets to event:", error);
    console.error("Error stack:", error.stack);
    res
      .status(500)
      .json({ error: "Failed to add assets to event", details: error.message });
  }
});

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await Asset.readAssets();
    res.json({ message: "Database connection successful", result });
  } catch (err) {
    console.error("Database connection error:", err);
    res
      .status(500)
      .json({ error: "Database connection failed", details: err.message });
  }
});

// Simple test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Server is running" });
});

const port = process.env.PORT || 5000;
app.listen(port, async () => {
  try {
    await Event.addCompletionColumns();
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error("Error setting up database:", error);
  }
});

const initializeTables = async () => {
  try {
    console.log("Starting table initialization...");
    await createEventsTable();
    console.log("Events table initialized");
    await User.createUserTable();
    console.log("Users table initialized");
    await Location.createLocationsTable();
    console.log("Locations table initialized");
    await Category.createCategoriesTable();
    console.log("Categories table initialized");
    await Asset.createAssetsTable();
    console.log("Assets table initialized");
    await Supplier.createSuppliersTable();
    console.log("Suppliers table initialized");
    await createEventAssetsTable();
    console.log("Event assets table initialized");
    await AssetIssue.createIssuesTable();
    console.log("Asset issues table initialized");
    await IncomingAssets.createIncomingAssetsTable();
    console.log("Incoming assets table initialized");
    await BorrowingRequest.createBorrowingRequestTable();
    await BorrowingRequest.createBorrowedAssetsTable();
    console.log("All tables initialized successfully");
  } catch (err) {
    console.error("Error initializing tables:", err);
  }
};

(async () => {
  try {
    await Event.addIsCompletedColumn();
    initializeTables();
  } catch (error) {
    console.error("Error during setup:", error);
  }
})();

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!res.headersSent) {
    res.status(500).send("Something broke!");
  }
});

const pool = require("./config/database");

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error connecting to the database", err);
  } else {
    console.log("Connected to the database");
  }
});

app.post("/api/events/:eventId/removeAsset", async (req, res) => {
  const client = await pool.connect();
  try {
    const { eventId } = req.params;
    const { assetId, quantity } = req.body;
    await client.query("BEGIN");
    // 1. Remove the asset from the event
    const removeAssetQuery = `
      DELETE FROM event_assets
      WHERE event_id = $1 AND asset_id = $2
      RETURNING quantity
    `;
    const removeResult = await client.query(removeAssetQuery, [
      eventId,
      assetId,
    ]);
    if (removeResult.rows.length === 0) {
      throw new Error("Asset not found in the event");
    }
    const removedQuantity = removeResult.rows[0].quantity;
    // 2. Update the asset's quantity in the main asset table
    const updateAssetQuery = `
      UPDATE assets
      SET quantity = quantity + $1
      WHERE asset_id = $2
      RETURNING quantity
    `;
    const updateResult = await client.query(updateAssetQuery, [
      removedQuantity,
      assetId,
    ]);
    if (updateResult.rows.length === 0) {
      throw new Error("Asset not found");
    }
    const updatedAssetQuantity = updateResult.rows[0].quantity;
    await client.query("COMMIT");
    // 3. Send a success response
    res.json({
      success: true,
      message: "Asset removed successfully",
      updatedAssetQuantity: updatedAssetQuantity,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error removing asset from event:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    client.release();
  }
});

app.delete("/api/Events/delete/:eventId", async (req, res) => {
  const client = await pool.connect();
  try {
    const { eventId } = req.params;
    await client.query("BEGIN");
    // Delete the event assets first
    const deleteAssetsResult = await client.query(
      "DELETE FROM event_assets WHERE event_id = $1",
      [eventId]
    );
    console.log(`Deleted ${deleteAssetsResult.rowCount} event assets`);
    // Then delete the event
    const deleteEventQuery =
      "DELETE FROM events WHERE unique_id = $1 RETURNING *";
    const result = await client.query(deleteEventQuery, [eventId]);
    if (result.rows.length === 0) {
      throw new Error("Event not found");
    }
    await client.query("COMMIT");
    res.json({
      success: true,
      message: "Event deleted successfully",
      deletedEvent: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting event:", error);
    console.error("Error stack:", error.stack);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
        stack: error.stack,
      });
  } finally {
    client.release();
  }
});

// Add this line to create the table when the server starts
AssetRequest.createAssetRequestTable();
const assetIssueRoutes = require("./routes/assetissueRoutes");
app.use("/api/asset-issues", assetIssueRoutes);

app.post("/api/asset-request", async (req, res) => {
  try {
    const { assetName, quantity, comments, created_by, user_picture } =
      req.body;

    const result = await pool.query(
      "INSERT INTO asset_requests (asset_name, quantity, comments, created_by, user_picture) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [assetName, quantity, comments, created_by, user_picture]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error creating asset request:", error);
    res.status(500).json({ error: "Failed to create asset request" });
  }
});

// Add this near your other route definitions
app.get("/api/Events/asset-cost/:eventId/:assetId", async (req, res) => {
  const client = await pool.connect();
  try {
    const { eventId, assetId } = req.params;
    console.log("Fetching cost for:", { eventId, assetId });

    const query = `
      SELECT a.cost, a."assetName"
      FROM assets a 
      WHERE a.asset_id = $1
    `;

    console.log("About to execute query:", { query, assetId });
    const result = await client.query(query, [assetId]);
    console.log("Query result:", result.rows);

    if (result.rows.length === 0) {
      console.log("No cost found for asset:", assetId);
      return res.status(404).json({ message: "Asset cost not found" });
    }

    // Convert the numeric cost to a number and ensure it's not null
    const cost = parseFloat(result.rows[0].cost) || 0;
    const assetName = result.rows[0].assetName;

    console.log("Sending response:", { assetName, cost });
    res.json({
      cost,
      assetName,
    });
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack,
      params: { eventId, assetId },
      query: error.query,
    });
    res.status(500).json({
      message: "Error fetching asset cost",
      error: error.message,
      details: error.stack,
    });
  } finally {
    client.release();
  }
});

app.use("*", (err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: "Server Error" });
});
