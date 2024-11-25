const { executeTransaction } = require("../utils/queryExecutor");

// Create the Role table
const createRoleTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Role (
      id SERIAL PRIMARY KEY,
      role_name VARCHAR(255) UNIQUE NOT NULL,
      permissions JSON DEFAULT '[]'
    )
  `;
  try {
    return await executeTransaction([{ query, params: [] }]);
  } catch (err) {
    console.error("Error creating Role table:", err);
    throw err;
  }
};

// Get all roles
const getRoles = async () => {
  const query = "SELECT role_name, permissions FROM Role";
  try {
    return await executeTransaction([{ query, params: [] }]);
  } catch (err) {
    console.error("Error fetching roles:", err);
    throw err;
  }
};

// Add a new role
const addRole = async (roleName) => {
  const query = "INSERT INTO Role (role_name) VALUES ($1) RETURNING role_name";
  try {
    return await executeTransaction([{ query, params: [roleName] }]);
  } catch (err) {
    console.error("Error adding role:", err);
    throw err;
  }
};

// Delete a role
const deleteRole = async (roleName) => {
  const query = "DELETE FROM Role WHERE role_name = $1 RETURNING role_name";
  try {
    return await executeTransaction([{ query, params: [roleName] }]);
  } catch (err) {
    console.error("Error deleting role:", err);
    throw err;
  }
};

const updateRolePermissions = async (roleName, permissions) => {
  const query = `
    UPDATE Role
    SET permissions = $1::jsonb
    WHERE role_name = $2
    RETURNING role_name, permissions
  `;
  return executeTransaction([
    { query, params: [JSON.stringify(permissions), roleName] },
  ]);
};

const getRolePermissionsFromDB = async (roleName) => {
  const query = `
    SELECT permissions
    FROM Role
    WHERE role_name = $1
  `;
  try {
    const result = await executeTransaction([{ query, params: [roleName] }]);
    return JSON.parse(result[0]?.permissions || "[]");
  } catch (err) {
    console.error("Error fetching role permissions:", err);
    throw err;
  }
};

const editRoleName = async (oldRoleName, newRoleName) => {
  const query = `
    UPDATE Role
    SET role_name = $1
    WHERE role_name = $2
    RETURNING role_name
  `;
  return executeTransaction([{ query, params: [newRoleName, oldRoleName] }]);
};


module.exports = {
  createRoleTable,
  getRoles,
  addRole,
  deleteRole,
  updateRolePermissions,
  getRolePermissionsFromDB,
  editRoleName,
};
