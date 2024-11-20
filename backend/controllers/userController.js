const {
  insertUser,
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  getUserByEmail,
  getCombinedPermissions,
} = require("../models/user");
const { getRolePermissionsFromDB } = require("../models/role");

const createUser = async (req, res) => {
  try {
    const { name, email, role, picture, hd, access } = req.body;
    console.log("Creating user with:", name, email, role, picture, hd, access);
    const result = await insertUser(name, email, role, picture, hd, access);
    console.log("User created:", result);
    res
      .status(201)
      .json({ message: "User created successfully", user: result[0] });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
};

const assignRoleToUser = async (req, res) => {
  const { id } = req.params; // User ID
  const { role } = req.body; // New role to assign

  if (!id || !role) {
    return res.status(400).json({ error: "User ID and role are required" });
  }

  try {
    // Fetch role permissions
    const rolePermissions = await getRolePermissionsFromDB(role);
    console.log(`Permissions for role ${role}:`, rolePermissions);

    // Fetch existing user
    const user = await getUserById(id);
    if (!user.length) {
      return res.status(404).json({ error: "User not found" });
    }

    // Combine user-specific permissions with role permissions
    const userPermissions = JSON.parse(user[0].permissions || "[]");
    const combinedPermissions = [
      ...new Set([...userPermissions, ...rolePermissions]),
    ];

    // Update user's role and permissions
    const updatedUser = await updateUser(
      id,
      user[0].name,
      user[0].email,
      role,
      user[0].picture,
      user[0].hd,
      user[0].access,
      JSON.stringify(combinedPermissions)
    );

    console.log("User updated with new role and permissions:", updatedUser);

    res
      .status(200)
      .json({ message: "Role assigned successfully", user: updatedUser[0] });
  } catch (error) {
    console.error("Error assigning role to user:", error);
    res
      .status(500)
      .json({ error: "Failed to assign role", details: error.toString() });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      console.log("Fetching user with ID:", id);
      const result = await getUserById(id);
      if (result.length === 0) {
        res.status(404).json({ message: "User not found" });
      } else {
        console.log("User fetched:", result);
        res.status(200).json({ user: result[0] });
      }
    } else {
      console.log("Fetching all users");
      const result = await getAllUsers();
      console.log("Users fetched:", result);
      res.status(200).json({ users: result });
    }
  } catch (error) {
    console.error("Error fetching user(s):", error);
    res.status(500).json({ message: "Error fetching user(s)", error });
  }
};

const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, picture, hd, access } = req.body;

    console.log("Editing user with ID:", id);

    // Pass the role to ensure permissions are updated
    const result = await updateUser(id, name, email, role, picture, hd, access);
    console.log("User updated:", result);

    res
      .status(200)
      .json({ message: "User updated successfully", user: result[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error });
  }
};

const checkUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Checking user with email:", email);
    const result = await getUserByEmail(email);
    if (result.length > 0) {
      console.log("User exists:", result);
      res.status(200).json({ exists: true, user: result[0] });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ message: "Error checking user", error });
  }
};

const getUserPermissions = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    console.error("Invalid or missing user ID");
    return res.status(400).json({ error: "Invalid or missing user ID" });
  }

  try {
    const permissions = await getCombinedPermissions(id);
    console.log("Permissions fetched:", permissions);
    res.status(200).json({ permissions });
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    res.status(500).json({ message: "Error fetching permissions", error });
  }
};

const getUserCombinedPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching combined permissions for user ID:", id);

    const combinedPermissions = await getCombinedPermissions(id);
    console.log("Permissions fetched:", combinedPermissions);

    res.status(200).json({ permissions: combinedPermissions });
  } catch (error) {
    console.error("Error fetching combined permissions:", error);
    res.status(500).json({ message: "Error fetching permissions", error });
  }
};

const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting user with ID:", id);
    await deleteUser(id);
    console.log("User deleted");
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error });
  }
};

module.exports = {
  createUser,
  getUser,
  editUser,
  removeUser,
  checkUserByEmail,
  getUserPermissions,
  assignRoleToUser,
  getUserCombinedPermissions,
};
