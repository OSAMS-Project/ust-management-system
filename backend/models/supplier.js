const { executeTransaction } = require('../utils/queryExecutor');
const pool = require('../config/database');

class Supplier {
  static async createSuppliersTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS suppliers (
        supplier_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        product VARCHAR(255) NOT NULL,
        streetAddress VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        contactNo VARCHAR(20) NOT NULL
      )
    `;
    await executeTransaction([{ query }]);
  }

  static async createSupplier(supplierData) {
    const { name, product, streetAddress, city, contactNo } = supplierData;
    const supplier_id = await this.getNextSupplierId();
    const query = 'INSERT INTO suppliers (supplier_id, name, product, streetAddress, city, contactNo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const params = [supplier_id, name, product, streetAddress, city, contactNo];
    const result = await executeTransaction([{ query, params }]);
    return result[0];
  }

  static async getAllSuppliers() {
    const query = 'SELECT supplier_id, name, product, streetAddress, city, contactNo FROM suppliers';
    const result = await executeTransaction([{ query }]);
    return result;
  }

  static async updateSupplier(supplier_id, supplierData) {
    const { name, product, streetAddress, city, contactNo } = supplierData;
    const query = 'UPDATE suppliers SET name = $1, product = $2, streetAddress = $3, city = $4, contactNo = $5 WHERE supplier_id = $6 RETURNING *';
    const params = [name, product, streetAddress, city, contactNo, supplier_id];
    const result = await executeTransaction([{ query, params }]);
    return result[0];
  }

  static async deleteSupplier(supplier_id) {
    const query = 'DELETE FROM suppliers WHERE supplier_id = $1 RETURNING *';
    const params = [supplier_id];
    const result = await executeTransaction([{ query, params }]);
    return result[0];
  }

  static async getNextSupplierId() {
    const query = 'SELECT supplier_id FROM suppliers ORDER BY supplier_id DESC LIMIT 1';
    const result = await executeTransaction([{ query }]);

    if (result.length === 0 || !result[0].supplier_id) {
      return 'OSA-SUPPLIER-0001';
    }

    const lastSupplierId = result[0].supplier_id;
    const lastNumber = parseInt(lastSupplierId.split('-')[2], 10);
    const nextNumber = lastNumber + 1;
    return `OSA-SUPPLIER-${nextNumber.toString().padStart(4, '0')}`;
  }
}

module.exports = Supplier;
