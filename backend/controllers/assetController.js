const Asset = require('../models/assets');
const { executeTransaction } = require('../utils/queryExecutor');
const pool = require('../config/database');
const moment = require('moment');
const OutgoingAsset = require('../models/outgoingassets');

const createAsset = async (req, res) => {
  try {
    const { productCode, serialNumber } = req.body;
    
    // Check for duplicate product code
    if (productCode && productCode !== 'N/A') {
      const existingAsset = await Asset.findByProductCode(productCode);
      if (existingAsset) {
        return res.status(400).json({ 
          error: "Duplicate product code", 
          message: "An asset with this product code already exists" 
        });
      }
    }

    // Check for duplicate serial number
    if (serialNumber && serialNumber !== 'N/A') {
      const existingSerialNumber = await Asset.findBySerialNumber(serialNumber);
      if (existingSerialNumber) {
        return res.status(400).json({ 
          error: "Duplicate serial number", 
          message: "An asset with this serial number already exists" 
        });
      }
    }

    const assetData = { 
      ...req.body, 
      productCode: req.body.productCode || '',
      serialNumber: req.body.serialNumber || '',
      added_by: req.user ? req.user.name : 'Unknown User'
    };
    const result = await Asset.createAsset(assetData);
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Error creating asset:", err);
    res.status(400).json({ 
      error: err.message || "Error creating asset",
      message: err.message || "Error creating asset"
    });
  }
};

const readAssets = async (req, res) => {
  try {
    const assets = await Asset.readAssets();
    console.log('Assets from database:', JSON.stringify(assets, null, 2));
    res.json(assets);
  } catch (err) {
    console.error("Error reading assets:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ error: "Error reading assets", details: err.toString() });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      lastUpdated: moment().format('MM-DD-YYYY')
    };
    
    // If quantity_for_borrowing is being updated
    if (updates.quantityForBorrowing !== undefined) {
      try {
        const pendingRequestsTotal = await checkPendingBorrowRequests(id);
        
        if (updates.quantityForBorrowing < pendingRequestsTotal) {
          return res.status(400).json({
            error: 'Cannot decrease quantity for borrowing below pending requests total',
            pendingRequestsTotal,
            requestedQuantity: updates.quantityForBorrowing
          });
        }

        // Update the quantity_for_borrowing in the updates object
        updates.quantity_for_borrowing = updates.quantityForBorrowing;
        delete updates.quantityForBorrowing;
      } catch (error) {
        console.error('Error checking pending requests:', error);
        return res.status(500).json({ 
          error: 'Error checking pending requests',
          details: error.message 
        });
      }
    }

    // Continue with update if validation passes
    try {
      const updatedAsset = await Asset.updateAsset(id, updates);
      if (!updatedAsset) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      res.json(updatedAsset);
    } catch (error) {
      console.error('Error updating asset:', error);
      res.status(500).json({ 
        error: 'Error updating asset',
        details: error.message 
      });
    }
  } catch (error) {
    console.error('Error in updateAsset:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const id = String(req.params.id);

    // Check if asset has active borrowing requests first
    const hasActiveBorrowings = await Asset.checkActiveBorrowings(id);

    // Delete the asset and all related records
    const deletedAsset = await Asset.deleteAsset(id);

    if (deletedAsset) {
      res.status(200).json({ 
        message: hasActiveBorrowings 
          ? 'Asset, related records, and active borrowing requests deleted successfully'
          : 'Asset and related records deleted successfully',
        deletedAsset
      });
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (err) {
    console.error("Error deleting asset:", err);
    res.status(500).json({ 
      error: "Error deleting asset", 
      details: err.message,
      hint: "This may be due to related records in other tables. Please check all related data before deleting."
    });
  }
};

const updateAssetActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, quantityForBorrowing } = req.body;

    // If trying to deactivate borrowing, check for pending requests
    if (!isActive) {
      const pendingRequestsQuery = `
        SELECT COUNT(*) as count 
        FROM borrowing_requests br 
        WHERE br.status = 'Pending' 
        AND br.selected_assets::jsonb @> '[{"asset_id": "${id}"}]'::jsonb
      `;
      const pendingResult = await pool.query(pendingRequestsQuery);
      const hasPendingRequests = parseInt(pendingResult.rows[0].count) > 0;

      if (hasPendingRequests) {
        return res.status(400).json({
          error: "Cannot deactivate borrowing",
          message: "Please reject all pending borrowing requests before deactivating borrowing for this asset."
        });
      }
    }

    const result = await Asset.updateAssetActiveStatus(
      id,
      isActive,
      quantityForBorrowing
    );

    if (!result) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Error updating asset active status:", error);
    res.status(500).json({ 
      error: "Error updating asset active status",
      message: error.message 
    });
  }
};

const getTotalActiveAssets = async (req, res) => {
  try {
    const count = await Asset.getTotalActiveAssets();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: "Error getting total active assets", details: err.toString() });
  }
};

const getTotalAvailableAssets = async (req, res) => {
  try {
    const count = await Asset.getTotalAvailableAssets();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: "Error getting total available assets", details: err.toString() });
  }
};

const getTotalBorrowingQuantity = async (req, res) => {
  try {
    const query = `
      SELECT COALESCE(SUM(quantity_for_borrowing), 0) AS totalBorrowingQuantity
      FROM assets
      WHERE is_active = true AND quantity_for_borrowing > 0
    `;
    const result = await pool.query(query);

    // Return the numeric totalBorrowingQuantity
    const totalBorrowingQuantity = Number(result.rows[0].totalBorrowingQuantity);

    res.status(200).json({ totalBorrowingQuantity });
  } catch (error) {
    console.error("Error fetching total quantity for borrowing:", error);
    res.status(500).json({ 
      error: "Error fetching total quantity for borrowing",
      details: error.message 
    });
  }
};


const getAssetsSortedByActiveStatus = async (req, res) => {
  const { sortOrder } = req.query;
  try {
    const result = await Asset.getAssetsSortedByActiveStatus(sortOrder);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Error getting sorted assets", details: err.toString() });
  }
};

const getActiveAssets = async (req, res) => {
  try {
    const activeAssets = await Asset.getActiveAssets();
    res.status(200).json(activeAssets);
  } catch (err) {
    console.error('Error in getActiveAssets:', err);
    res.status(500).json({ error: "Error getting active assets", details: err.toString() });
  }
};

const updateAssetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const statusData = req.body;
    const result = await Asset.updateAssetStatus(id, statusData);
    
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (error) {
    console.error('Error updating asset status:', error);
    res.status(500).json({ 
      error: 'Error updating asset status', 
      details: error.message 
    });
  }
};

const handleIncomingAsset = async (req, res) => {
  try {
    const { assetName, quantity, category, location, cost, type } = req.body;

    if (!assetName || !quantity) {
      return res.status(400).json({ error: "Asset name and quantity are required." });
    }

    // Fetch the existing asset by name
    const existingAsset = await Asset.findByAssetName(assetName);

    if (existingAsset) {
      // Sum the quantities
      const updatedQuantity =
        parseInt(existingAsset.quantity, 10) + parseInt(quantity, 10);

      // Update the existing asset's quantity
      const updatedAsset = await Asset.updateAsset(existingAsset.asset_id, {
        quantity: updatedQuantity,
      });

      return res.status(200).json({
        message: `Asset quantity updated: ${existingAsset.assetName}`,
        asset: updatedAsset,
      });
    }

    // If asset doesn't exist, create a new one
    const assetData = {
      assetName,
      quantity: parseInt(quantity, 10),
      category,
      location,
      cost: parseFloat(cost) || 0,
      type,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    const result = await Asset.createAsset(assetData);

    res.status(201).json({
      message: `New asset created successfully.`,
      asset: result,
    });
  } catch (error) {
    console.error("Error in handleIncomingAsset:", error);
    res.status(500).json({
      error: "Failed to process the asset.",
      details: error.message,
    });
  }
};


const updateAssetIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { has_issue } = req.body;
    const result = await Asset.updateAssetIssueStatus(id, has_issue);
    
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (error) {
    console.error('Error updating asset issue status:', error);
    res.status(500).json({ 
      error: 'Error updating asset issue status', 
      details: error.message 
    });
  }
};

// Update the checkPendingBorrowRequests function
const checkPendingBorrowRequests = async (assetId) => {
  try {
    const query = `
      SELECT COALESCE(SUM(CAST((borrowed_asset->>'quantity') AS INTEGER)), 0) as total_requested
      FROM borrowing_requests br, 
      jsonb_array_elements(selected_assets) as borrowed_asset
      WHERE borrowed_asset->>'asset_id' = $1 
      AND br.status = 'Pending'
    `;
    const result = await executeTransaction([{ query, params: [assetId] }]);
    return parseInt(result[0].total_requested) || 0;
  } catch (error) {
    console.error('Error checking pending borrow requests:', error);
    throw error;
  }
};

const checkProductCode = async (req, res) => {
  try {
    const { productCode } = req.params;
    
    // Skip check if productCode is empty or 'N/A'
    if (!productCode || productCode === 'N/A') {
      return res.json({ exists: false });
    }

    const existingAsset = await Asset.findByProductCode(productCode);
    res.json({ exists: !!existingAsset });
  } catch (error) {
    console.error('Error checking product code:', error);
    res.status(500).json({ 
      error: 'Error checking product code',
      details: error.message 
    });
  }
};

const checkSerialNumber = async (req, res) => {
  try {
    const { serialNumber } = req.params;
    
    // Skip check if serialNumber is empty or 'N/A'
    if (!serialNumber || serialNumber === 'N/A') {
      return res.json({ exists: false });
    }

    const existingAsset = await Asset.findBySerialNumber(serialNumber);
    res.json({ exists: !!existingAsset });
  } catch (error) {
    console.error('Error checking serial number:', error);
    res.status(500).json({ 
      error: 'Error checking serial number',
      details: error.message 
    });
  }
};

// Function to fetch all assets
const getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.readAssets();
    res.status(200).json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ 
      error: "Failed to fetch assets.",
      details: error.message,
    });
  }
};

const consumeAsset = async (req, res) => {
  const client = await pool.connect();
  try {
    const { assetId, quantityConsumed, reason } = req.body;
    const consumedBy = req.body.consumedBy || 'System User'; // You can get this from auth

    await client.query('BEGIN');

    // Check if asset exists and has sufficient quantity
    const assetResult = await client.query(
      'SELECT * FROM assets WHERE asset_id = $1',
      [assetId]
    );

    if (assetResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Asset not found' });
    }

    const asset = assetResult.rows[0];
    if (asset.quantity < quantityConsumed) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Insufficient quantity',
        available: asset.quantity,
        requested: quantityConsumed
      });
    }

    // Update asset quantity
    await client.query(
      'UPDATE assets SET quantity = quantity - $1 WHERE asset_id = $2',
      [quantityConsumed, assetId]
    );

    // Create outgoing asset record
    const outgoingAsset = await OutgoingAsset.createOutgoingAsset({
      asset_id: assetId,
      quantity: quantityConsumed,
      reason,
      consumed_by: consumedBy,
      status: 'Consumed'
    });

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Asset consumed successfully',
      consumedBy,
      outgoingAsset,
      remainingQuantity: asset.quantity - quantityConsumed
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error consuming asset:', error);
    res.status(500).json({
      error: 'Failed to consume asset',
      details: error.message
    });
  } finally {
    client.release();
  }
};

module.exports = {
  createAsset,
  readAssets,
  updateAsset,
  deleteAsset,
  updateAssetActiveStatus,
  getTotalActiveAssets,
  getTotalAvailableAssets,
  getAssetsSortedByActiveStatus,
  getActiveAssets,
  updateAssetStatus,
  updateAssetIssueStatus,
  checkProductCode,
  checkPendingBorrowRequests,
  getTotalBorrowingQuantity,
  checkSerialNumber,
  handleIncomingAsset,
  getAllAssets,
  consumeAsset,
};
