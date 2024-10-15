const { executeTransaction } = require('../utils/queryExecutor');

class BorrowLogs {
  static async createBorrowLogsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS borrow_logs (
        id SERIAL PRIMARY KEY,
        asset_id VARCHAR(20) REFERENCES Assets(asset_id),
        borrower_name VARCHAR(255) NOT NULL,
        borrower_email VARCHAR(255) NOT NULL,
        borrower_department VARCHAR(255) NOT NULL,
        date_borrowed TIMESTAMP NOT NULL,
        date_returned TIMESTAMP,
        borrowing_request_id INTEGER REFERENCES borrowing_requests(id)
      )
    `;
    return executeTransaction([{ query, params: [] }]);
  }

  static async createBorrowLog(logData) {
    const query = `
      INSERT INTO borrow_logs (
        asset_id, borrower_name, borrower_email, borrower_department, 
        quantity_borrowed, date_borrowed, date_returned, borrowing_request_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `;
    
    const logPromises = logData.assetId.map((assetId, index) => {
      const params = [
        assetId,
        logData.borrowerName,
        logData.borrowerEmail,
        logData.borrowerDepartment,
        logData.quantityBorrowed[index],
        logData.dateBorrowed,
        logData.dateReturned,
        logData.borrowingRequestId
      ];
      return executeTransaction([{ query, params }]);
    });

    return Promise.all(logPromises);
  }

  static async getBorrowLogsByAssetId(assetId) {
    const query = `
      SELECT *, quantity_borrowed FROM borrow_logs
      WHERE asset_id = $1
      ORDER BY date_borrowed DESC
    `;
    return executeTransaction([{ query, params: [assetId] }]);
  }

  static async updateBorrowLogReturnDate(borrowingRequestId, dateReturned) {
    const query = `
      UPDATE borrow_logs
      SET date_returned = $1
      WHERE borrowing_request_id = $2
      RETURNING *
    `;
    return executeTransaction([{ query, params: [dateReturned, borrowingRequestId] }]);
  }
}

module.exports = BorrowLogs;
