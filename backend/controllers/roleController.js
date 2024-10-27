const Role = require('../models/role');

// Get Roles Controller
const getRoles = async (req, res) => {
  try {
    const result = await Role.getRoles();
    res.status(200).json(result);
  } catch (err) {
    console.error('Error in getRoles controller:', err); // Debug log
    res.status(500).json({ error: "Error fetching roles", details: err.toString() });
  }
};

// Add Role Controller
const addRole = async (req, res) => {
  const { roleName } = req.body;
  if (!roleName) {
    return res.status(400).json({ error: "Role name is required" });
  }
  try {
    const result = await Role.addRole(roleName);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error in addRole controller:', err); // Debug log
    res.status(500).json({ error: "Error adding role", details: err.toString() });
  }
};

// Delete Role Controller
const deleteRole = async (req, res) => {
  const { roleName } = req.params;
  if (!roleName) {
    return res.status(400).json({ error: "Role name is required for deletion" });
  }
  try {
    const result = await Role.deleteRole(roleName);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: "Role not found" });
    }
  } catch (err) {
    console.error('Error in deleteRole controller:', err); // Debug log
    res.status(500).json({ error: "Error deleting role", details: err.toString() });
  }
};

module.exports = {
  getRoles,
  addRole,
  deleteRole
};
