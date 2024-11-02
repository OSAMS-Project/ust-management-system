const { executeTransaction } = require('../utils/queryExecutor');

const createSupplierActivityLogsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS SupplierActivityLogs (
      id SERIAL PRIMARY KEY,
      supplier_id VARCHAR(20) REFERENCES Suppliers(supplier_id),
      action VARCHAR(50) NOT NULL,
      field_name VARCHAR(50),
      old_value TEXT,
      new_value TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  return executeTransaction([{ query, params: [] }]);
};

const logSupplierActivity = async (supplierId, action, fieldName, oldValue, newValue) => {
  const query = `
    INSERT INTO SupplierActivityLogs (supplier_id, action, field_name, old_value, new_value)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [supplierId, action, fieldName, oldValue, newValue];
  return executeTransaction([{ query, params: values }]);
};

const getSupplierActivityLogs = async (supplierId) => {
  const query = `
    SELECT * FROM SupplierActivityLogs
    WHERE supplier_id = $1
    ORDER BY timestamp DESC
  `;
  return executeTransaction([{ query, params: [supplierId] }]);
};

module.exports = {
  createSupplierActivityLogsTable,
  logSupplierActivity,
  getSupplierActivityLogs
};
