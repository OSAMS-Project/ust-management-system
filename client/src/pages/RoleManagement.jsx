import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faChevronDown,
  faChevronUp,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

const RoleManagement = ({ onRoleUpdate }) => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRoles, setTotalRoles] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [editingRole, setEditingRole] = useState(null);
  const [updatedRoleName, setUpdatedRoleName] = useState("");

  const permissionDependencies = {
    "Asset Lists": [
      "Asset Repair",
      "Asset Issues",
      "Asset Request",
      "Archived Requests",
      "Incoming Assets",
      "Asset Maintenance",
      "Asset Details",
    ],
    "Borrowing Requests": ["Borrowing History"],
    "Events Management": ["Completed Events"],
  };

  const predefinedPages = [
    "Dashboard",
    "Asset Lists",
    "Borrowing Requests",
    "Supplier Lists",
    "Events Management",
    "Asset Management",
    "Asset Request",
    "Asset Repair",
    "Asset Issues",
    "Asset Maintenance",
    "Asset Details",
    "Incoming Assets",
    "Completed Events",
    "Archived Requests",
    "Borrowing History",
    "Terms Settings",
  ];

  const API_URL = `${process.env.REACT_APP_API_URL}/api/roles`;

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);

      const rolesWithPermissions = response.data
        .map((role) => ({
          ...role,
          permissions: role.permissions || [],
        }))
        .sort((a, b) => a.role_name.localeCompare(b.role_name)); // Sort roles by name

      setRoles(rolesWithPermissions);
      setTotalRoles(rolesWithPermissions.length);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Error fetching roles");
      console.error("Error fetching roles:", err);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.trim()) {
      setError("Role name cannot be empty.");
      return;
    }

    // Prevent creation of 'Administrator' role
    if (newRole.trim().toLowerCase() === "administrator") {
      setError("Creation of 'Administrator' role is not allowed.");
      return;
    }

    try {
      await axios.post(`${API_URL}`, { roleName: newRole });
      await fetchRoles(); // Re-fetch updated roles
      setNewRole("");
      setError(null);
      console.log("Role added successfully");
    } catch (err) {
      setError("Error adding role");
      console.error("Error adding role:", err);
    }
  };

  const handleDeleteRole = async (roleName) => {
    try {
      await axios.delete(`${API_URL}/${roleName}`);
      await fetchRoles(); // Re-fetch updated roles
      setError(null);
      console.log("Role deleted successfully");
    } catch (err) {
      setError("Error deleting role");
      console.error("Error deleting role:", err);
    }
  };

  const handlePermissionChange = async (roleName, page) => {
    // Prevent modifying specific permissions
    if (["User Management", "Role Management"].includes(page)) {
      setError("You cannot modify permissions for this page.");
      return;
    }

    const role = roles.find((r) => r.role_name === roleName);
    if (!role) {
      setError("Role not found.");
      return;
    }

    let updatedPermissions = [];
    if (role.permissions.includes(page)) {
      updatedPermissions = role.permissions.filter((p) => p !== page);
      if (permissionDependencies[page]) {
        updatedPermissions = updatedPermissions.filter(
          (perm) => !permissionDependencies[page].includes(perm)
        );
      }
    } else {
      updatedPermissions = [...role.permissions, page];
      if (permissionDependencies[page]) {
        updatedPermissions = [
          ...new Set([...updatedPermissions, ...permissionDependencies[page]]),
        ];
      }
    }

    try {
      await axios.put(`${API_URL}/${roleName}/permissions`, {
        permissions: updatedPermissions,
      });

      // Update the permissions locally without re-sorting the array
      setRoles((prevRoles) =>
        prevRoles.map((r) =>
          r.role_name === roleName
            ? { ...r, permissions: updatedPermissions }
            : r
        )
      );
      setError(null);
    } catch (err) {
      console.error("Error updating permissions:", err);
      setError("Failed to update permissions.");
    }
  };

  const toggleDropdown = (roleName) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [roleName]: !prev[roleName],
    }));
  };

  const handleEditRoleName = async (oldRoleName) => {
    if (!updatedRoleName.trim()) {
      setError("Role name cannot be empty.");
      return;
    }

    try {
      await axios.put(`${API_URL}/edit-name`, {
        oldRoleName,
        newRoleName: updatedRoleName,
      });

      setRoles(
        (prevRoles) =>
          prevRoles
            .map((r) =>
              r.role_name === oldRoleName
                ? { ...r, role_name: updatedRoleName }
                : r
            )
            .sort((a, b) => a.role_name.localeCompare(b.role_name)) // Keep roles sorted
      );
      setEditingRole(null);
      setUpdatedRoleName("");
      setError(null);
    } catch (err) {
      setError("Error editing role name");
      console.error("Error editing role name:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">Role Management</h1>
        <FontAwesomeIcon icon={faUsers} className="text-black text-5xl transform" />
      </div>

      <div className="px-4">
        <div className="rounded-md">
          <h2 className="text-xl font-semibold">Add New Role</h2>
          <div className="flex items-center mt-2">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Enter role name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleAddRole}
              className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Add Role
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>

      <div className="px-4">
        {loading ? (
          <p>Loading roles...</p>
        ) : (
          <div className="bg-white overflow-hidden">
            <p className="text-sm text-gray-600 px-4 py-2">
              <strong>Note:</strong> Changes to roles and permissions will
              require users to log in again for the updates to take effect.
            </p>
            <table className="min-w-full bg-white border-collapse">
              <thead className="bg-black text-[#FEC00F]">
                <tr>
                  <th className="py-2 px-4 border-b text-center">#</th>
                  <th className="py-2 px-4 border-b text-center">Role Name</th>
                  <th className="py-2 px-4 border-b text-center">
                    Permissions
                  </th>
                  <th className="py-2 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, index) => (
                  <tr
                    key={role.role_name}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
                    } cursor-pointer hover:bg-gray-50`}
                  >
                    <td className="py-2 px-4 border-b text-center">
                      {index + 1}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {editingRole === role.role_name ? (
                        <input
                          type="text"
                          value={updatedRoleName}
                          onChange={(e) => setUpdatedRoleName(e.target.value)}
                          className="border border-gray-300 rounded-md px-2 py-1"
                        />
                      ) : (
                        role.role_name
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      <div>
                        <button
                          onClick={() => toggleDropdown(role.role_name)}
                          className="flex items-center text-blue-500"
                        >
                          {dropdownOpen[role.role_name]
                            ? "Hide Permissions"
                            : "Manage Permissions"}
                          <FontAwesomeIcon
                            icon={
                              dropdownOpen[role.role_name]
                                ? faChevronUp
                                : faChevronDown
                            }
                            className="ml-2"
                          />
                        </button>
                        {dropdownOpen[role.role_name] && (
                          <div className="mt-2 bg-gray-100 border rounded-md p-2">
                            <div className="grid grid-cols-2 gap-1">
                              {predefinedPages.map((page) => (
                                <label
                                  key={page}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={role.permissions.includes(page)}
                                    onChange={() =>
                                      handlePermissionChange(
                                        role.role_name,
                                        page
                                      )
                                    }
                                    className="mr-2"
                                  />
                                  <span className="text-gray-800">{page}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {editingRole === role.role_name ? (
                        <button
                          onClick={() => handleEditRoleName(role.role_name)}
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition duration-300"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingRole(role.role_name);
                            setUpdatedRoleName(role.role_name);
                          }}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition duration-300"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRole(role.role_name)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300 ml-2"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleManagement;
