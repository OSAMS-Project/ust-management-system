const pool = require('../config/database');

const getAllMaintenanceRecords = async () => {
  try {
    const query = `
      SELECT * FROM maintenance_records 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error in getAllMaintenanceRecords:', error);
    throw error;
  }
};

const createMaintenanceRecord = async (maintenanceData) => {
  try {
    const {
      asset_id,
      maintenance_type,
      description,
      scheduled_date,
      priority,
      performed_by,
      maintenance_cost,
      technician_notes,
      maintenance_quantity,
      scheduled_by,
      user_picture
    } = maintenanceData;

    const query = `
      INSERT INTO maintenance_records (
        asset_id,
        maintenance_type,
        description,
        scheduled_date,
        status,
        priority,
        performed_by,
        maintenance_cost,
        technician_notes,
        maintenance_quantity,
        scheduled_by,
        user_picture
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    const values = [
      asset_id,
      maintenance_type,
      description,
      scheduled_date,
      'Scheduled',
      priority,
      performed_by,
      maintenance_cost,
      technician_notes,
      maintenance_quantity,
      scheduled_by,
      user_picture
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error in createMaintenanceRecord:', error);
    throw error;
  }
};

const updateMaintenanceRecord = async (id, updateData) => {
  try {
    const fields = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const values = [...Object.values(updateData), id];

    const query = `
      UPDATE maintenance_records 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateMaintenanceRecord:', error);
    throw error;
  }
};

const deleteMaintenanceRecord = async (id) => {
  try {
    const query = `
      DELETE FROM maintenance_records 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in deleteMaintenanceRecord:', error);
    throw error;
  }
};

const getMaintenanceHistory = async (assetId) => {
  try {
    const query = `
      SELECT * FROM maintenance_records 
      WHERE asset_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [assetId]);
    return result.rows;
  } catch (error) {
    console.error('Error in getMaintenanceHistory:', error);
    throw error;
  }
};

const getMaintenanceRecordById = async (id) => {
  try {
    const query = `
      SELECT * FROM maintenance_records 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in getMaintenanceRecordById:', error);
    throw error;
  }
};

// Exporting the functions
module.exports = {
  getAllMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceHistory,
  getMaintenanceRecordById,
}; 