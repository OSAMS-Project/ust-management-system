const { executeTransaction } = require('../utils/queryExecutor');

const createRoleTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Role (
      id SERIAL PRIMARY KEY,
      role_name VARCHAR(255) UNIQUE NOT NULL
    )
  `;
  try {
    return await executeTransaction([{ query, params: [] }]);
  } catch (err) {
    console.error('Error creating Role table:', err);
    throw err;
  }
};

const getRoles = async () => {
  const query = "SELECT role_name FROM Role";
  try {
    return await executeTransaction([{ query, params: [] }]);
  } catch (err) {
    console.error('Error fetching roles:', err);
    throw err;
  }
};

const addRole = async (roleName) => {
  const query = "INSERT INTO Role (role_name) VALUES ($1) RETURNING role_name";
  try {
    return await executeTransaction([{ query, params: [roleName] }]);
  } catch (err) {
    console.error('Error adding role:', err);
    throw err;
  }
};

const deleteRole = async (roleName) => {
  const query = "DELETE FROM Role WHERE role_name = $1 RETURNING role_name";
  try {
    return await executeTransaction([{ query, params: [roleName] }]);
  } catch (err) {
    console.error('Error deleting role:', err);
    throw err;
  }
};

module.exports = {
  getRoles,
  addRole,
  createRoleTable,
  deleteRole
};
