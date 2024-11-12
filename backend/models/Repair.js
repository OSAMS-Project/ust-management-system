const pool = require('../config/database');
const { executeTransaction } = require('../utils/queryExecutor');

const Repair = {
  getAllRepairRecords: async () => {
    const query = `
      SELECT * FROM repair_records 
      ORDER BY date DESC
    `;
    return executeTransaction([{ query, params: [] }]);
  },

  getRepairRecordsByAsset: async (assetId) => {
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
      console.error('Error in getRepairRecordsByAsset:', error);
      throw error;
    }
  },

  createRepairRecord: async (data) => {
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
      'Pending',
      parseInt(data.repair_quantity) || 1,
      data.issue_id ? parseInt(data.issue_id) : null
    ];
    
    console.log('Creating repair record with values:', values);
    return executeTransaction([{ query, params: values }]);
  },

  completeRepairRecord: async (id) => {
    const query = `
      UPDATE repair_records 
      SET status = 'Completed',
          completion_date = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `;
    return executeTransaction([{ query, params: [parseInt(id)] }]);
  },

  deleteRepairRecord: async (id) => {
    const query = 'DELETE FROM repair_records WHERE id = $1 RETURNING *';
    return executeTransaction([{ query, params: [parseInt(id)] }]);
  }
};

module.exports = Repair;
