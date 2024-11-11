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
        fixed_date,
        created_at,
        updated_at
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
      (asset_id, repair_type, description, date, cost, performed_by, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pending')
      RETURNING *
    `;
    const values = [
      data.asset_id,
      data.repair_type,
      data.description,
      data.date || new Date(),
      data.cost,
      data.performed_by
    ];
    
    return executeTransaction([{ query, params: values }]);
  },

  completeRepairRecord: async (id, fixedDate) => {
    const query = `
      UPDATE repair_records 
      SET status = 'Completed',
          fixed_date = $2
      WHERE id = $1 
      RETURNING *
    `;
    return executeTransaction([{ query, params: [id, fixedDate] }]);
  },

  deleteRepairRecord: async (id) => {
    const query = 'DELETE FROM repair_records WHERE id = $1 RETURNING *';
    return executeTransaction([{ query, params: [id] }]);
  }
};

module.exports = Repair;
