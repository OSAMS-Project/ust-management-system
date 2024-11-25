const Asset = require('../models/assets');
const { executeTransaction } = require('../utils/queryExecutor');

const createAsset = async (req, res) => {
  try {
    const { productCode } = req.body;
    
    // Skip duplicate check if productCode is empty or 'N/A'
    if (productCode && productCode !== 'N/A') {
      // Check for existing product code
      const existingAsset = await Asset.findByProductCode(productCode);
      if (existingAsset) {
        return res.status(400).json({ 
          error: "Duplicate product code", 
          message: "An asset with this product code already exists" 
        });
      }
    }

    const assetData = { 
      ...req.body, 
      productCode: req.body.productCode || '',
      added_by: req.user ? req.user.name : 'Unknown User'
    };
    const result = await Asset.createAsset(assetData);
    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Error creating asset:", err);
    res.status(500).json({ error: "Error creating asset", details: err.toString() });
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
    const updates = req.body;

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
    const { isActive, quantityForBorrowing } = req.body; // Ensure this is being sent correctly
    const result = await Asset.updateAssetActiveStatus(id, isActive, quantityForBorrowing);
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (error) {
    console.error('Error updating asset active status:', error);
    res.status(500).json({ message: 'Error updating asset active status', error: error.message });
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
      FROM Assets
      WHERE is_active = true AND quantity_for_borrowing > 0
    `;
    const result = await pool.query(query);

    // Return the numeric totalBorrowingQuantity
    const totalBorrowingQuantity = Number(result.rows[0].totalBorrowingQuantity);

    res.status(200).json({ totalBorrowingQuantity });
  } catch (error) {
    console.error("Error fetching total quantity for borrowing:", error);
    res.status(500).json({ error: "Error fetching total quantity for borrowing" });
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
  getTotalBorrowingQuantity
};
