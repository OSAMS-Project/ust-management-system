const Role = require("../models/role");

// Get all roles
const getRoles = async (req, res) => {
  try {
    const result = await Role.getRoles();
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getRoles controller:", err);
    res
      .status(500)
      .json({ error: "Error fetching roles", details: err.toString() });
  }
};

// Add a new role
const addRole = async (req, res) => {
  const { roleName } = req.body;
  if (!roleName) {
    return res.status(400).json({ error: "Role name is required" });
  }
  try {
    const result = await Role.addRole(roleName);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in addRole controller:", err);
    res
      .status(500)
      .json({ error: "Error adding role", details: err.toString() });
  }
};

// Delete a role
const deleteRole = async (req, res) => {
  const { roleName } = req.params;
  if (!roleName) {
    return res
      .status(400)
      .json({ error: "Role name is required for deletion" });
  }
  try {
    const result = await Role.deleteRole(roleName);
    if (result.length) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ error: "Role not found" });
    }
  } catch (err) {
    console.error("Error in deleteRole controller:", err);
    res
      .status(500)
      .json({ error: "Error deleting role", details: err.toString() });
  }
};

// Update role permissions
const updateRolePermissions = async (req, res) => {
  const { roleName } = req.params;
  const { permissions } = req.body;

  if (!roleName || !Array.isArray(permissions)) {
    return res
      .status(400)
      .json({ error: "Role name and permissions are required" });
  }

  try {
    const result = await Role.updateRolePermissions(roleName, permissions);
    res.status(200).json(result[0]);
  } catch (err) {
    console.error("Error in updateRolePermissions controller:", err);
    res
      .status(500)
      .json({ error: "Failed to update permissions", details: err.toString() });
  }
};

const validatePermissions = (permissions) => {
  if (!Array.isArray(permissions)) {
    throw new Error("Permissions must be an array");
  }
  // Ensure all permissions are strings and not empty
  return permissions.filter(
    (perm) => typeof perm === "string" && perm.trim() !== ""
  );
};

// Get permissions for a role
const getRolePermissions = async (req, res) => {
  const { roleName } = req.params;
  if (!roleName) {
    return res.status(400).json({ error: "Role name is required" });
  }
  try {
    const permissions = await getRolePermissionsFromDB(roleName); // Fetch from the database
    res.status(200).json({ permissions });
  } catch (err) {
    console.error("Error fetching role permissions:", err);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
};

const editRoleName = async (req, res) => {
  const { oldRoleName, newRoleName } = req.body;

  if (!oldRoleName || !newRoleName) {
    return res
      .status(400)
      .json({ error: "Both old and new role names are required." });
  }

  try {
    const result = await Role.editRoleName(oldRoleName, newRoleName);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Role not found." });
    }

    res.status(200).json({ message: "Role name updated successfully." });
  } catch (err) {
    console.error("Error in editRoleName controller:", err);
    res
      .status(500)
      .json({ error: "Error updating role name", details: err.toString() });
  }
};

module.exports = {
  getRoles,
  addRole,
  deleteRole,
  updateRolePermissions,
  getRolePermissions,
  validatePermissions,
  editRoleName,
};
