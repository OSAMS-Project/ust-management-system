const { executeTransaction } = require('../utils/queryExecutor');
const pool = require('../config/database');  // Adjust the path if necessary

const createAssetsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Assets (
      asset_id VARCHAR(20) UNIQUE NOT NULL,
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
      quantity_for_borrowing BIGINT DEFAULT 0
    )
  `;
  return executeTransaction([{ query, params: [] }]);
};

const getNextAssetId = async () => {
  const result = await executeTransaction([
    {
      query: "SELECT asset_id FROM Assets ORDER BY asset_id DESC LIMIT 1",
      params: [],
    },
  ]);

  if (result.length === 0 || !result[0].asset_id) {
    return 'OSA-ASSET-0001';
  }

  const lastAssetId = result[0].asset_id;
  const lastNumber = parseInt(lastAssetId.split('-')[2], 10);
  const nextNumber = lastNumber + 1;
  return `OSA-ASSET-${nextNumber.toString().padStart(4, '0')}`;
};

const createAsset = async (data) => {
  const nextAssetId = await getNextAssetId();
  data.asset_id = nextAssetId;

  const columns = Object.keys(data).map((key) => `"${key}"`).join(", ");
  const values = Object.values(data);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

  const query = `INSERT INTO Assets (${columns}) VALUES (${placeholders}) RETURNING *`;
  return executeTransaction([{ query, params: values }]);
};

const readAssets = async () => {
  const query = "SELECT *, quantity_for_borrowing FROM Assets";
  return executeTransaction([{ query, params: [] }]);
};

const updateAsset = async (values, id) => {
  try {
    console.log('Updating asset with values:', JSON.stringify(values, null, 2));
    console.log('Asset ID:', id);

    const { lastUpdated, quantityForBorrowing, ...updateValues } = values;
    if (quantityForBorrowing !== undefined) {
      updateValues.quantity_for_borrowing = quantityForBorrowing;
    }

    const setString = Object.keys(updateValues)
      .map((key, i) => `"${key}" = $${i + 1}`)
      .join(", ");

    const query = `
      UPDATE Assets 
      SET ${setString}, "lastUpdated" = CURRENT_TIMESTAMP 
      WHERE asset_id = $${Object.keys(updateValues).length + 1} 
      RETURNING *
    `;

    const params = [...Object.values(updateValues), id];

    console.log('Update query:', query);
    console.log('Update params:', params);

    const result = await executeTransaction([{ query, params }]);

    console.log('Update result:', JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error('Error in updateAsset:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
};

const deleteAsset = async (assetId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const deleteActivityLogsQuery = 'DELETE FROM AssetActivityLogs WHERE asset_id = $1';
    await client.query(deleteActivityLogsQuery, [assetId]);

    const deleteBorrowLogsQuery = 'DELETE FROM borrow_logs WHERE asset_id = $1';
    await client.query(deleteBorrowLogsQuery, [assetId]);

    const deleteAssetQuery = 'DELETE FROM Assets WHERE asset_id = $1 RETURNING *';
    const result = await client.query(deleteAssetQuery, [assetId]);

    await client.query('COMMIT');

    if (result.rows.length === 0) {
      throw new Error('Asset not found');
    }

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in deleteAsset:', error);
    throw error;
  } finally {
    client.release();
  }
};

const updateAssetActiveStatus = async (assetId, isActive, quantityForBorrowing = 0) => {
  const getAssetQuery = 'SELECT quantity, quantity_for_borrowing FROM Assets WHERE asset_id = $1';
  const assetResult = await executeTransaction([{ query: getAssetQuery, params: [assetId] }]);

  if (assetResult.length === 0) {
    throw new Error('Asset not found');
  }

  const assetQuantity = assetResult[0].quantity;

  if (isActive) {
    const maxQuantityForBorrowing = Math.min(quantityForBorrowing, assetQuantity);

    const query = `
      UPDATE Assets 
      SET is_active = $1, quantity_for_borrowing = $2, quantity = quantity - $2
      WHERE asset_id = $3 
      RETURNING *
    `;
    return executeTransaction([{ query, params: [isActive, maxQuantityForBorrowing, assetId] }]);
  } else {
    const query = `
      UPDATE Assets 
      SET is_active = $1, quantity = quantity + $2, quantity_for_borrowing = 0
      WHERE asset_id = $3 
      RETURNING *
    `;
    return executeTransaction([{ query, params: [isActive, assetResult[0].quantity_for_borrowing, assetId] }]);
  }
};

const getTotalActiveAssets = async () => {
  const query = "SELECT COUNT(*) as count FROM Assets WHERE is_active = true";
  const result = await executeTransaction([{ query, params: [] }]);
  return parseInt(result[0].count, 10);
};

const getTotalAvailableAssets = async () => {
  const query = "SELECT COUNT(*) as count FROM Assets WHERE quantity > 0";
  const result = await executeTransaction([{ query, params: [] }]);
  return result[0].count;
};

const getAssetsSortedByActiveStatus = async (sortOrder) => {
  const query = `
    SELECT * FROM Assets
    ORDER BY is_active ${sortOrder === 'activeFirst' ? 'DESC' : 'ASC'}, "assetName" ASC
  `;
  return executeTransaction([{ query, params: [] }]);
};

const getTotalAssets = async () => {
  const query = 'SELECT COUNT(*) as total FROM Assets';
  const result = await executeTransaction([{ query, params: [] }]);
  return parseInt(result[0].total, 10);
};

const getRecentlyAddedAssets = async (limit) => {
  const query = 'SELECT asset_id, "assetName", "createdDate" FROM Assets ORDER BY "createdDate" DESC LIMIT $1';
  const result = await executeTransaction([{ query, params: [limit] }]);
  return result;
};

const getActiveAssets = async () => {
  const query = 'SELECT asset_id, "assetName", quantity_for_borrowing FROM Assets WHERE is_active = true';
  return executeTransaction([{ query, params: [] }]);
};

const updateQuantity = async (assetId, newQuantity) => {
  const query = 'UPDATE Assets SET quantity = $1 WHERE asset_id = $2 RETURNING *';
  const values = [newQuantity, assetId];
  try {
    const result = await pool.query(query, values);
    console.log(`Asset ${assetId} quantity updated to ${newQuantity}`);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating asset quantity:', error);
    throw error;
  }
};

const updateAssetQuantity = async (assetId, quantityChange) => {
  const query = `
    UPDATE Assets 
    SET quantity_for_borrowing = quantity_for_borrowing + $1 
    WHERE asset_id = $2 
    RETURNING *
  `;
  const params = [quantityChange, assetId];
  return executeTransaction([{ query, params }]);
};

const readAsset = async (assetId) => {
  const query = 'SELECT * FROM Assets WHERE asset_id = $1';
  const result = await executeTransaction([{ query, params: [assetId] }]);
  return result[0];
};

const getTotalAssetsForBorrowing = async () => {
  const query = "SELECT COUNT(*) as count FROM Assets WHERE is_active = true AND quantity_for_borrowing > 0";
  const result = await executeTransaction([{ query, params: [] }]);
  return parseInt(result[0].count, 10);
};

module.exports = {
  createAssetsTable,
  createAsset,
  readAssets,
  updateAsset,
  deleteAsset,
  updateAssetActiveStatus,
  getTotalActiveAssets,
  getTotalAvailableAssets,
  getAssetsSortedByActiveStatus,
  getTotalAssets,
  getRecentlyAddedAssets,
  getActiveAssets,
  updateQuantity,
  updateAssetQuantity,
  readAsset,
  getTotalAssetsForBorrowing
};
