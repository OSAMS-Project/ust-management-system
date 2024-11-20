import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faChevronDown, faChevronUp, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRoles, setTotalRoles] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState({});

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
    "User Management": ["Role Management"],
  };

  const predefinedPages = [
    "Dashboard",
    "Asset Lists",
    "Borrowing Requests",
    "Supplier Lists",
    "Events Management",
    "User Management",
    "Role Management",
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
  ];

  const API_URL = `${process.env.REACT_APP_API_URL}/api/roles`;

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);

      const rolesWithPermissions = response.data.map((role) => ({
        ...role,
        permissions: role.permissions || [],
      }));

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
    if (!newRole.trim()) return;
    try {
      const response = await axios.post(`${API_URL}`, { roleName: newRole });
      setRoles([...roles, { ...response.data, permissions: [] }]);
      setNewRole("");
      setTotalRoles((prevTotal) => prevTotal + 1);
    } catch (err) {
      setError("Error adding role");
      console.error("Error adding role:", err);
    }
  };

  const handleDeleteRole = async (roleName) => {
    try {
      await axios.delete(`${API_URL}/${roleName}`);
      setRoles(roles.filter((role) => role.role_name !== roleName));
      setTotalRoles((prevTotal) => prevTotal - 1);
    } catch (err) {
      setError("Error deleting role");
      console.error("Error deleting role:", err);
    }
  };

  const handlePermissionChange = async (roleName, page) => {
    const role = roles.find((r) => r.role_name === roleName);

    let updatedPermissions = [];
    if (role.permissions.includes(page)) {
      // Uncheck the permission
      updatedPermissions = role.permissions.filter((p) => p !== page);

      // Remove dependent permissions if the parent is unchecked
      if (permissionDependencies[page]) {
        updatedPermissions = updatedPermissions.filter(
          (perm) => !permissionDependencies[page].includes(perm)
        );
      }
    } else {
      // Check the permission
      updatedPermissions = [...role.permissions, page];

      // Add dependent permissions if the parent is checked
      if (permissionDependencies[page]) {
        updatedPermissions = [...new Set([...updatedPermissions, ...permissionDependencies[page]])];
      }
    }

    try {
      await axios.put(`${API_URL}/${roleName}/permissions`, {
        permissions: updatedPermissions,
      });

      setRoles((prevRoles) =>
        prevRoles.map((r) =>
          r.role_name === roleName
            ? { ...r, permissions: updatedPermissions }
            : r
        )
      );
    } catch (err) {
      console.error("Error updating permissions:", err);
    }
  };

  const toggleDropdown = (roleName) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [roleName]: !prev[roleName],
    }));
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-yellow-400 py-6 flex items-center justify-between px-6">
        <h1 className="text-3xl font-bold text-black">Role Management</h1>
        <FontAwesomeIcon icon={faUsers} className="text-3xl text-black" />
      </div>

      <div className="px-4">
        <div className="bg-yellow-200 p-4 rounded-md">
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
          <div className="bg-white rounded-md shadow-md overflow-hidden">
            <table className="min-w-full text-left">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3">Role Name</th>
                  <th className="px-6 py-3">Permissions</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.role_name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {role.role_name}
                    </td>
                    <td className="px-6 py-4">
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
                          <div className="mt-2 bg-gray-100 border rounded-md p-4">
                            {predefinedPages.map((page) => (
                              <label key={page} className="block">
                                <input
                                  type="checkbox"
                                  checked={role.permissions.includes(page)}
                                  onChange={() =>
                                    handlePermissionChange(role.role_name, page)
                                  }
                                  className="mr-2"
                                />
                                {page}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteRole(role.role_name)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
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
