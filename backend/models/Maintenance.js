const pool = require('../config/database');

const Maintenance = {
  createMaintenanceTable: async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS maintenance_records (
        id SERIAL PRIMARY KEY,
        asset_id VARCHAR(20) REFERENCES Assets(asset_id),
        maintenance_type VARCHAR(100) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        cost DECIMAL(10, 2),
        performed_by VARCHAR(100),
        status VARCHAR(20) DEFAULT 'Pending',
        fixed_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    try {
      await pool.query(query);
      console.log('maintenance_records table created successfully');
    } catch (error) {
      console.error('Error creating maintenance_records table:', error);
      throw error;
    }
  },

  getAllMaintenanceRecords: async () => {
    const query = 'SELECT * FROM maintenance_records ORDER BY date DESC';
    const { rows } = await pool.query(query);
    return rows;
  },

  createMaintenanceRecord: async (recordData) => {
    console.log('Creating maintenance record with data:', recordData);
    const { asset_id, maintenance_type, description, date, cost, performed_by } = recordData;
    if (!maintenance_type) {
      throw new Error('Maintenance type is required');
    }
    const query = `
      INSERT INTO maintenance_records (asset_id, maintenance_type, description, date, cost, performed_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [asset_id, maintenance_type, description, date, cost, performed_by];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  completeMaintenanceRecord: async (id, fixedDate) => {
    const query = 'UPDATE maintenance_records SET status = $1, fixed_date = $2 WHERE id = $3 RETURNING *';
    const values = ['Completed', fixedDate, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  deleteMaintenanceRecord: async (id) => {
    const query = 'DELETE FROM maintenance_records WHERE id = $1 RETURNING *';
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  getMaintenanceRecordsByAsset: async (assetId) => {
    const query = 'SELECT * FROM maintenance_records WHERE asset_id = $1 ORDER BY date DESC';
    const values = [assetId];
    const { rows } = await pool.query(query, values);
    return rows;
  }
};

module.exports = Maintenance;
