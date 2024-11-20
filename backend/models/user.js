const { executeTransaction } = require("../utils/queryExecutor");
const getCombinedPermissions = async (userId) => {
  if (!userId || isNaN(userId)) {
    throw new Error("Invalid or missing user ID");
  }

  const query = `
    SELECT u.permissions AS user_permissions, r.permissions AS role_permissions
    FROM Users u
    LEFT JOIN Role r ON u.role = r.role_name
    WHERE u.id = $1
  `;
  const params = [userId];
  const result = await executeTransaction([{ query, params }]);

  console.log("Raw Database Result:", result); // Debugging

  let userPermissions = [];
  let rolePermissions = [];

  try {
    const userPermissionsRaw = result[0]?.user_permissions || "[]";
    const rolePermissionsRaw = result[0]?.role_permissions || "[]";

    // If already arrays, use them directly
    userPermissions = Array.isArray(userPermissionsRaw)
      ? userPermissionsRaw
      : JSON.parse(userPermissionsRaw);

    rolePermissions = Array.isArray(rolePermissionsRaw)
      ? rolePermissionsRaw
      : JSON.parse(rolePermissionsRaw);

    // Combine and deduplicate
    return [...new Set([...userPermissions, ...rolePermissions])];
  } catch (error) {
    console.error("Error parsing permissions:", {
      userPermissionsRaw: result[0]?.user_permissions,
      rolePermissionsRaw: result[0]?.role_permissions,
    });
    throw new Error("Invalid JSON format in permissions");
  }
};

const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(255),
      picture VARCHAR(255),
      hd VARCHAR(255),
      access BOOLEAN DEFAULT FALSE,
      permissions JSON DEFAULT '[]'
    )
  `;
  return executeTransaction([{ query, params: [] }]);
};

const addPermissionsColumnToUsers = async () => {
  const query = `
    ALTER TABLE Users
    ADD COLUMN IF NOT EXISTS permissions JSON DEFAULT '[]'
  `;
  try {
    await executeTransaction([{ query, params: [] }]);
    console.log("Permissions column added to Users table");
  } catch (err) {
    console.error("Error adding permissions column:", err);
    throw err;
  }
};
const insertUser = async (name, email, role, picture, hd, access = false, permissions = []) => {
  const query = `
    INSERT INTO Users (name, email, role, picture, hd, access, permissions)
    VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
    RETURNING *
  `;
  const params = [name, email, role, picture, hd, access, JSON.stringify(permissions)];
  return executeTransaction([{ query, params }]);
};


const getUserById = async (id) => {
  const query = "SELECT * FROM Users WHERE id = $1";
  const params = [id];
  return executeTransaction([{ query, params }]);
};

const getAllUsers = async () => {
  const query = "SELECT * FROM Users";
  return executeTransaction([{ query, params: [] }]);
};
const updateUser = async (
  id,
  name,
  email,
  role,
  picture,
  hd,
  access,
  permissions = "[]"
) => {
  let rolePermissions = permissions;

  if (role) {
    // Fetch permissions from the Role table if role is provided
    const queryRolePermissions = `
      SELECT permissions
      FROM Role
      WHERE role_name = $1
    `;
    const roleResult = await executeTransaction([
      { query: queryRolePermissions, params: [role] },
    ]);
    rolePermissions = roleResult[0]?.permissions || "[]";
  }

  // Ensure permissions are valid JSON
  if (typeof rolePermissions === "string") {
    try {
      rolePermissions = JSON.parse(rolePermissions);
    } catch (err) {
      console.error("Invalid permissions JSON:", rolePermissions);
      rolePermissions = []; // Default to an empty array if parsing fails
    }
  }

  const query = `
    UPDATE Users
    SET name = $1, email = $2, role = $3, picture = $4, hd = $5, access = $6, permissions = $7
    WHERE id = $8
    RETURNING *
  `;
  const params = [
    name,
    email,
    role,
    picture,
    hd,
    access,
    JSON.stringify(rolePermissions), // Ensure permissions are stored as JSON
    id,
  ];
  return executeTransaction([{ query, params }]);
};

const deleteUser = async (id) => {
  const query = `
    DELETE FROM Users
    WHERE id = $1
  `;
  const params = [id];
  return executeTransaction([{ query, params }]);
};

const getUserPermissions = async (id) => {
  const query = `
    SELECT permissions
    FROM Users
    WHERE id = $1
  `;
  const params = [id];
  const result = await executeTransaction([{ query, params }]);
  return result[0]?.permissions || [];
};

const getUserByEmail = async (email) => {
  const query = "SELECT * FROM Users WHERE email = $1";
  const params = [email];
  return executeTransaction([{ query, params }]);
};

const validatePermissions = (permissions) => {
  try {
    if (!Array.isArray(permissions)) {
      throw new Error("Permissions must be an array");
    }
    JSON.stringify(permissions); // Ensure it's valid JSON
    return permissions;
  } catch (err) {
    console.error("Invalid permissions:", permissions);
    throw new Error("Permissions must be a valid JSON array");
  }
};

module.exports = {
  createUserTable,
  addPermissionsColumnToUsers,
  insertUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserPermissions,
  getCombinedPermissions,
  getUserByEmail,
};
