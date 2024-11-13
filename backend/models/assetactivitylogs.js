const { executeTransaction } = require('../utils/queryExecutor');
const pool = require('../config/database');

const createAssetActivityLogsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS AssetActivityLogs (
      id SERIAL PRIMARY KEY,
      asset_id VARCHAR(20) REFERENCES Assets(asset_id),
      action VARCHAR(50) NOT NULL,
      field_name VARCHAR(50),
      old_value TEXT,
      new_value TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER
    )
  `;
  return executeTransaction([{ query, params: [] }]);
};

const logAssetActivity = async (assetId, action, fieldName, oldValue, newValue, userId, context = null) => {
  const query = `
    INSERT INTO AssetActivityLogs (
      asset_id, 
      action, 
      field_name, 
      old_value, 
      new_value, 
      user_id,
      context
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  const values = [assetId, action, fieldName, oldValue, newValue, userId, context];
  return executeTransaction([{ query, params: values }]);
};

const getAssetActivityLogs = async (assetId) => {
  const query = `
    SELECT * FROM AssetActivityLogs
    WHERE asset_id = $1
    ORDER BY timestamp DESC
  `;
  return executeTransaction([{ query, params: [assetId] }]);
};

const createAssetActivityLog = async (asset_id, action, field_name, old_value, new_value) => {
  const query = `
    INSERT INTO AssetActivityLogs (asset_id, action, field_name, old_value, new_value)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const params = [asset_id, action, field_name, old_value, new_value];
  return executeTransaction([{ query, params }]);
};

const logEventAllocation = async (assetId, quantity, eventName, userId) => {
  const query = `
    INSERT INTO AssetActivityLogs (asset_id, action, field_name, old_value, new_value, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  const values = [assetId, 'event_allocation', 'event_allocation', quantity.toString(), eventName, userId];
  return executeTransaction([{ query, params: values }]);
};

module.exports = {
  createAssetActivityLogsTable,
  logAssetActivity,
  getAssetActivityLogs,
  createAssetActivityLog,
  logEventAllocation,
};
