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
      modified_by VARCHAR(255),
      user_picture TEXT,
      context TEXT
    )
  `;
  return executeTransaction([{ query, params: [] }]);
};

const logAssetActivity = async (assetId, action, fieldName, oldValue, newValue, modifiedBy, userPicture, context = null) => {
  const query = `
    INSERT INTO AssetActivityLogs (
      asset_id, 
      action, 
      field_name, 
      old_value, 
      new_value, 
      modified_by,
      user_picture,
      context
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const values = [assetId, action, fieldName, oldValue, newValue, modifiedBy, userPicture, context];
  return executeTransaction([{ query, params: values }]);
};

const getAssetActivityLogs = async (assetId) => {
  const query = `
    SELECT 
      id,
      asset_id,
      action,
      field_name,
      old_value,
      new_value,
      modified_by,
      user_picture,
      context,
      created_at
    FROM AssetActivityLogs
    WHERE asset_id = $1
    ORDER BY created_at DESC, id DESC
  `;
  return executeTransaction([{ query, params: [assetId] }]);
};

const logEventAllocation = async (assetId, quantity, eventName, modifiedBy, userPicture) => {
  const query = `
    INSERT INTO AssetActivityLogs (
      asset_id, 
      action, 
      field_name, 
      old_value, 
      new_value, 
      modified_by,
      user_picture,
      context
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const values = [
    assetId, 
    'event_allocation', 
    'event_allocation', 
    quantity.toString(), 
    eventName, 
    modifiedBy,
    userPicture,
    `Event Allocation: ${quantity} units allocated to event "${eventName}"`
  ];
  return executeTransaction([{ query, params: values }]);
};

const logEventReturn = async (assetId, quantity, eventName, modifiedBy, userPicture) => {
  const query = `
    INSERT INTO AssetActivityLogs (
      asset_id, 
      action, 
      field_name, 
      old_value, 
      new_value, 
      modified_by,
      user_picture,
      context
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;
  const values = [
    assetId, 
    'event_return', 
    'event_return', 
    '', 
    '', 
    modifiedBy,
    userPicture,
    `Event Return: ${quantity} unit(s) returned from event "${eventName}"`
  ];
  return executeTransaction([{ query, params: values }]);
};

module.exports = {
  createAssetActivityLogsTable,
  logAssetActivity,
  getAssetActivityLogs,
  logEventAllocation,
  logEventReturn
};
