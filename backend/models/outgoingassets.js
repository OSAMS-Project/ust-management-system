const pool = require('../config/database');

class OutgoingAsset {
  static async createTableIfNotExists() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS outgoing_assets (
          id SERIAL PRIMARY KEY,
          asset_id VARCHAR(20) REFERENCES assets(asset_id),
          quantity INTEGER NOT NULL,
          reason TEXT,
          consumed_by VARCHAR(255),
          consumed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) DEFAULT 'Consumed',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Outgoing assets table verified/created');
    } catch (error) {
      console.error('Error creating outgoing_assets table:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async getAllOutgoingAssets() {
    const client = await pool.connect();
    try {
      await this.createTableIfNotExists();
      
      const query = `
        SELECT 
          oa.*,
          a."assetName",
          a.type,
          a.category
        FROM outgoing_assets oa
        LEFT JOIN assets a ON a.asset_id = oa.asset_id
        ORDER BY oa.consumed_date DESC
      `;
      
      const result = await client.query(query);
      console.log('Query result:', result.rows);
      return result.rows;
    } catch (error) {
      console.error('Error in getAllOutgoingAssets:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async createOutgoingAsset(data) {
    const client = await pool.connect();
    try {
      await this.createTableIfNotExists();
      
      const query = `
        INSERT INTO outgoing_assets (
          asset_id,
          quantity,
          reason,
          consumed_by,
          status
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [
        data.asset_id,
        data.quantity,
        data.reason || '',
        data.consumed_by || 'Unknown User',
        'Consumed'
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in createOutgoingAsset:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateOutgoingAsset(id, data) {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE outgoing_assets
        SET 
          quantity = COALESCE($1, quantity),
          reason = COALESCE($2, reason),
          consumed_by = COALESCE($3, consumed_by),
          status = COALESCE($4, status)
        WHERE id = $5
        RETURNING *
      `;
      
      const values = [
        data.quantity,
        data.reason,
        data.consumed_by,
        data.status,
        id
      ];

      const result = await client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateOutgoingAsset:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteOutgoingAsset(id) {
    const client = await pool.connect();
    try {
      const query = 'DELETE FROM outgoing_assets WHERE id = $1 RETURNING *';
      const result = await client.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in deleteOutgoingAsset:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = OutgoingAsset;
