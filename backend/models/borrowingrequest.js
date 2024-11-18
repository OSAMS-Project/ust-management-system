const pool = require('../config/database');
const { executeTransaction } = require('../utils/queryExecutor');

class BorrowingRequest {
  static async addDateReturnedColumn() {
    const query = `
      ALTER TABLE borrowing_requests 
      ADD COLUMN IF NOT EXISTS date_returned TIMESTAMP;
    `;
    return executeTransaction([{ query }]);
  }

  static async createBorrowingRequestTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS borrowing_requests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        purpose TEXT NOT NULL,
        contact_no VARCHAR(20) NOT NULL,
        cover_letter_path TEXT,
        selected_assets JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_to_be_collected DATE,
        date_collected TIMESTAMP,
        expected_return_date DATE,
        date_returned TIMESTAMP,
        notes TEXT
      )
    `;
    await executeTransaction([{ query }]);
    return true;
  }

  static async createBorrowingRequest(requestData) {
    try {
      // First, insert the borrowing request
      const borrowingRequestQuery = `
        INSERT INTO borrowing_requests (
          name, 
          email, 
          department, 
          purpose, 
          contact_no, 
          cover_letter_url, 
          expected_return_date,
          date_to_be_collected,
          date_requested,
          notes,
          status,
          selected_assets
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9, 'Pending', $10)
        RETURNING id;
      `;

      // Convert selectedAssets array to JSONB string
      const selectedAssetsJson = JSON.stringify(requestData.selectedAssets || []);

      const borrowingValues = [
        requestData.name,
        requestData.email,
        requestData.department,
        requestData.purpose,
        requestData.contactNo,
        requestData.coverLetterUrl,
        requestData.expectedReturnDate,
        requestData.dateToBeCollected,
        requestData.notes,
        selectedAssetsJson
      ];

      // Insert the borrowing request and get its ID
      const borrowingResult = await pool.query(borrowingRequestQuery, borrowingValues);
      const requestId = borrowingResult.rows[0].id;

      // Then, insert the borrowed assets
      if (requestData.selectedAssets && requestData.selectedAssets.length > 0) {
        const borrowedAssetsQuery = `
          INSERT INTO borrowed_assets (
            request_id, 
            asset_id, 
            quantity
          ) 
          VALUES ($1, $2, $3);
        `;

        // Insert each selected asset
        for (const asset of requestData.selectedAssets) {
          await pool.query(borrowedAssetsQuery, [
            requestId,
            asset.assetId,
            asset.quantity
          ]);
        }
      }

      console.log('Borrowing request created successfully');
      return requestId;
    } catch (error) {
      console.error('Error in createBorrowingRequest:', error);
      throw error;
    }
  }

  static async getAllBorrowingRequests() {
    try {
      const query = `
        SELECT 
          br.*,
          json_agg(
            json_build_object(
              'assetName', sa->>'assetName',
              'quantity', sa->>'quantity'
            )
          ) as asset_details
        FROM borrowing_requests br
        CROSS JOIN jsonb_array_elements(br.selected_assets::jsonb) sa
        GROUP BY br.id, br.name, br.email, br.department, br.purpose, 
                 br.contact_no, br.date_requested, br.date_to_be_collected, 
                 br.expected_return_date, br.status, br.notes, br.cover_letter_path
        ORDER BY br.date_requested DESC;
      `;

      const result = await executeTransaction([{ query }]);
      
      return result.map(row => ({
        ...row,
        borrowed_asset_names: Array.isArray(row.asset_details) && row.asset_details[0] !== null
          ? row.asset_details.map(a => a.assetName).join(', ')
          : 'N/A',
        borrowed_asset_quantities: Array.isArray(row.asset_details) && row.asset_details[0] !== null
          ? row.asset_details.map(a => a.quantity).join(', ')
          : 'N/A',
        cover_letter_url: row.cover_letter_path 
          ? `/api/borrowing-requests/${row.id}/cover-letter` 
          : null
      }));

    } catch (error) {
      console.error('Model Error:', error);
      throw error;
    }
  }

  static async updateBorrowingRequestStatus(requestId, status) {
    try {
      console.log('Model: Updating status:', { requestId, status }); // Debug log

      const updateQuery = `
        UPDATE borrowing_requests 
        SET 
          status = $1
        WHERE id = $2 
        RETURNING *;
      `;
      
      const result = await pool.query(updateQuery, [status, requestId]);
      
      console.log('Database update result:', result.rows[0]); // Debug log

      if (result.rows.length === 0) {
        throw new Error('Borrowing request not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Model Error:', error);
      throw error;
    }
  }

  static async getBorrowingRequestById(id) {
    const query = 'SELECT * FROM borrowing_requests WHERE id = $1';
    const result = await executeTransaction([{ query, params: [id] }]);
    return result[0];
  }

  static async deleteBorrowingRequest(requestId) {
    const query = 'DELETE FROM borrowing_requests WHERE id = $1 RETURNING *';
    const params = [requestId];
    try {
      const result = await executeTransaction([{ query, params }]);
      return result[0]; // Return the deleted request data if needed
    } catch (error) {
      console.error('Error in deleteBorrowingRequest:', error);
      throw error;
    }
  }

  static async getTotalPendingRequests() {
    const query = "SELECT COUNT(*) as count FROM borrowing_requests WHERE status = 'Pending'";
    const result = await executeTransaction([{ query, params: [] }]);
    return parseInt(result[0].count, 10);
  }

  static async getTotalAcceptedRequests() {
    const query = "SELECT COUNT(*) as count FROM borrowing_requests WHERE status = 'Approved'";
    const result = await executeTransaction([{ query, params: [] }]);
    return parseInt(result[0].count, 10);
  }

  static async getBorrowingHistory() {
    const query = `
      SELECT *
      FROM borrowing_requests
      WHERE status IN ('Returned', 'Approved', 'Rejected')
      ORDER BY created_at DESC
    `;
    const result = await executeTransaction([{ query }]);
    return result.map(row => ({
      ...row,
      borrowed_asset_names: row.selected_assets.map(asset => asset.assetName).join(', '),
      borrowed_asset_quantities: row.selected_assets.map(asset => asset.quantity).join(', '),
      cover_letter_url: row.cover_letter_path ? `/api/borrowing-requests/${row.id}/cover-letter` : null,
      expectedReturnDate: row.expected_return_date,
      notes: row.notes
    }));
  }

  static async createBorrowedAssetsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS borrowed_assets (
        id SERIAL PRIMARY KEY,
        request_id INTEGER REFERENCES borrowing_requests(id),
        asset_id VARCHAR(255) REFERENCES assets(asset_id),
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    try {
      await executeTransaction([{ query }]);
      console.log('Borrowed assets table created successfully');
    } catch (error) {
      console.error('Error creating borrowed assets table:', error);
      throw error;
    }
  }

  static async createBorrowingRequestsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS borrowing_requests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        purpose TEXT,
        contact_no VARCHAR(255) NOT NULL,
        cover_letter_url TEXT,
        selected_assets JSONB,
        date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_to_be_collected TIMESTAMP,
        expected_return_date DATE,
        status VARCHAR(50) DEFAULT 'Pending',
        notes TEXT
      );
    `;
    
    try {
      await pool.query(query);
      console.log('Borrowing requests table created successfully');
      return true;
    } catch (error) {
      console.error('Error creating borrowing requests table:', error);
      throw error;
    }
  }

  static async createBorrowedAsset({ requestId, assetId, quantity }) {
    const query = `
      INSERT INTO borrowed_assets (request_id, asset_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [requestId, assetId, quantity];
    
    try {
      const result = await executeTransaction([{ query, params: values }]);
      return result[0];
    } catch (error) {
      console.error('Error creating borrowed asset:', error);
      throw error;
    }
  }

  static async checkTableExists() {
    try {
      const query = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'borrowing_requests'
        );
      `;
      
      const result = await pool.query(query);
      console.log('Table exists check result:', result.rows[0].exists);
      return result.rows[0].exists;
    } catch (error) {
      console.error('Error checking table:', error);
      return false;
    }
  }

  static async getTableCount() {
    try {
      const query = `SELECT COUNT(*) FROM borrowing_requests;`;
      const result = await pool.query(query);
      const count = parseInt(result.rows[0].count);
      console.log('Table count:', count);
      return count;
    } catch (error) {
      console.error('Error counting rows:', error);
      return 0;
    }
  }
}

module.exports = BorrowingRequest;
