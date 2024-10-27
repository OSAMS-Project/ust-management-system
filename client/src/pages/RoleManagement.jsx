import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRoles, setTotalRoles] = useState(0); // State for total roles

  // Base URL for API
  const API_URL = `${process.env.REACT_APP_API_URL}/api/roles`;

  // Fetch roles from the API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setRoles(response.data);
      setTotalRoles(response.data.length); // Update the total roles count
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Error fetching roles');
      console.error('Error fetching roles:', err); // Debug log
    }
  };

  // Add a new role
  const handleAddRole = async () => {
    if (!newRole.trim()) return;
    try {
      const response = await axios.post(`${API_URL}`, { roleName: newRole });
      setRoles([...roles, response.data]);
      setNewRole('');
      setTotalRoles(prevTotal => prevTotal + 1); // Increment total roles
    } catch (err) {
      setError('Error adding role');
      console.error('Error adding role:', err); // Debug log
    }
  };

  // Delete a role
  const handleDeleteRole = async (roleName) => {
    try {
      await axios.delete(`${API_URL}/${roleName}`);
      setRoles(roles.filter((role) => role.role_name !== roleName));
      setTotalRoles(prevTotal => prevTotal - 1); // Decrement total roles
    } catch (err) {
      setError('Error deleting role');
      console.error('Error deleting role:', err); // Debug log
    }
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
                  <th className="py-3 px-4 border-b text-center">User Picture</th>
                  <th className="py-3 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.role_name} className="hover:bg-gray-50 transition duration-150">
                    <td className="py-4 px-6 border-b text-center">{role.role_name}</td>
                    <td className="py-4 px-6 border-b text-center">
                      <img
                        src="https://via.placeholder.com/100"
                        alt="User"
                        className="w-16 h-16 rounded-full object-cover mx-auto"
                      />
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
