import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRoles, setTotalRoles] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState({});

  const predefinedPermissions = ["Read", "Write", "Edit", "Delete"];

  const API_URL = `${process.env.REACT_APP_API_URL}/api/roles`;

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setRoles(response.data.map((role) => ({ ...role, permissions: [] }))); // Initialize with empty permissions
      setTotalRoles(response.data.length);
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

  const handlePermissionChange = (roleName, permission) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.role_name === roleName
          ? {
              ...role,
              permissions: role.permissions.includes(permission)
                ? role.permissions.filter((perm) => perm !== permission)
                : [...role.permissions, permission],
            }
          : role
      )
    );
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
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">Role Management</h1>
        <FontAwesomeIcon
          icon={faUsers}
          className="text-black text-5xl transform"
        />
      </div>

      <div className="px-4">
        <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full px-5 py-1 text-center uppercase tracking-wider">
          Roles Summary
        </div>

        {/* Total Roles Display */}
        <div className="px-4 my-6">
          <div
            className="bg-yellow-400 p-6 rounded-lg shadow-md flex items-center justify-center h-48 bg-cover bg-center relative overflow-hidden"
            style={{ backgroundImage: "url('ust-img-4.JPG')" }}
          >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="text-7xl font-bold text-yellow-400">
                {totalRoles}
              </h2>
              <p className="text-2xl font-semibold text-white mt-2">
                Total Roles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Add Section */}
      <div className="px-4 my-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Add New Role</h2>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              placeholder="Role Name"
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
            <button
              onClick={handleAddRole}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            >
              Add Role
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>

      {/* Roles Table */}
      <div className="px-4">
        <div className="bg-white shadow-lg overflow-x-auto rounded-lg">
          {loading ? (
            <p className="text-center py-4">Loading roles...</p>
          ) : (
            <table className="min-w-full bg-white border-collapse">
              <thead className="bg-black text-[#FEC00F]">
                <tr>
                  <th className="py-3 px-4 border-b text-center">Role Name</th>
                  <th className="py-3 px-4 border-b text-center">Permissions</th>
                  <th className="py-3 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr
                    key={role.role_name}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="py-4 px-6 border-b text-center">
                      {role.role_name}
                    </td>
                    <td className="py-4 px-6 border-b text-center relative">
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(role.role_name)}
                          className="bg-gray-100 text-black px-3 py-2 rounded-full shadow-md hover:bg-gray-200 focus:outline-none"
                        >
                          Manage Permissions
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className="ml-2 text-sm"
                          />
                        </button>
                        {dropdownOpen[role.role_name] && (
                          <div className="absolute z-10 bg-white border rounded shadow-md mt-2 p-4 w-64">
                            {predefinedPermissions.map((permission) => (
                              <label
                                key={permission}
                                className="block text-sm font-medium text-gray-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={role.permissions.includes(permission)}
                                  onChange={() =>
                                    handlePermissionChange(
                                      role.role_name,
                                      permission
                                    )
                                  }
                                  className="mr-2"
                                />
                                {permission}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 border-b text-center">
                      <button
                        onClick={() => handleDeleteRole(role.role_name)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
