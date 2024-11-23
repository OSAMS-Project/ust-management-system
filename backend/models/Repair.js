const pool = require("../config/database");
const { executeTransaction } = require("../utils/queryExecutor");

const getAllRepairRecords = async () => {
  const query = `
    SELECT * FROM repair_records 
    ORDER BY date DESC
  `;
  return executeTransaction([{ query, params: [] }]);
};

const getRepairRecordsByAsset = async (assetId) => {
  const query = `
    SELECT 
      id,
      asset_id,
      repair_type,
      description,
      date,
      cost,
      performed_by,
      status,
      repair_quantity,
      completion_date,
      created_at
    FROM repair_records 
    WHERE asset_id = $1 
    ORDER BY date DESC
  `;
  try {
    const result = await executeTransaction([{ query, params: [assetId] }]);
    return result;
  } catch (error) {
    console.error("Error in getRepairRecordsByAsset:", error);
    throw error;
  }
};

const createRepairRecord = async (data) => {
  const query = `
    INSERT INTO repair_records 
    (asset_id, repair_type, description, date, cost, performed_by, status, repair_quantity, issue_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    data.asset_id,
    data.repair_type,
    data.description,
    data.date || new Date(),
    parseFloat(data.cost),
    data.performed_by,
    "Pending",
    parseInt(data.repair_quantity) || 1,
    data.issue_id ? parseInt(data.issue_id) : null,
  ];

  console.log("Creating repair record with values:", values);
  return executeTransaction([{ query, params: values }]);
};

const completeRepairRecord = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get repair record details
    const getRepairQuery = `
      SELECT * FROM repair_records 
      WHERE id = $1
    `;
    const repairRecord = (await client.query(getRepairQuery, [id])).rows[0];

    if (!repairRecord) {
      throw new Error("Repair record not found");
    }

    // Update repair record status
    const updateRepairQuery = `
      UPDATE repair_records 
      SET status = 'Completed',
          completion_date = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    const result = await client.query(updateRepairQuery, [id]);

    // Restore asset quantity
    const updateAssetQuery = `
      UPDATE assets 
      SET quantity = quantity + $1,
          under_repair = false,
          has_issue = false
      WHERE asset_id = $2 
      RETURNING *
    `;
    await client.query(updateAssetQuery, [
      repairRecord.repair_quantity,
      repairRecord.asset_id,
    ]);

    await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const cancelRepairRecord = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get repair record details
    const getRepairQuery = `
      SELECT * FROM repair_records 
      WHERE id = $1
    `;
    const repairRecord = (await client.query(getRepairQuery, [id])).rows[0];

    if (!repairRecord) {
      throw new Error("Repair record not found");
    }

    // Update related issue status back to pending
    if (repairRecord.issue_id) {
      const updateIssueQuery = `
        UPDATE asset_issues 
        SET status = 'Pending'
        WHERE id = $1
      `;
      await client.query(updateIssueQuery, [repairRecord.issue_id]);
    }

    // Update asset repair status
    const updateAssetQuery = `
      UPDATE assets 
      SET under_repair = false
      WHERE asset_id = $1
    `;
    await client.query(updateAssetQuery, [repairRecord.asset_id]);

    // Delete the repair record
    const deleteRepairQuery = `
      DELETE FROM repair_records 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await client.query(deleteRepairQuery, [id]);

    await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const deleteRepairRecord = async (id) => {
  const query = "DELETE FROM repair_records WHERE id = $1 RETURNING *";
  return executeTransaction([{ query, params: [parseInt(id)] }]);
};

const getTotalRepairs = async () => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS total FROM repair_records WHERE status != 'Completed'"
    );
    return result.rows[0].total; // Return the total count
  } catch (error) {
    console.error("Error getting total repairs:", error);
    throw error;
  }
};

// Exporting the functions
module.exports = {
  getAllRepairRecords,
  getRepairRecordsByAsset,
  createRepairRecord,
  completeRepairRecord,
  deleteRepairRecord,
  getTotalRepairs,
  cancelRepairRecord
};
