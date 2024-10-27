import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faUsers } from '@fortawesome/free-solid-svg-icons';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // State for storing available roles
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalUsersWithAccess, setTotalUsersWithAccess] = useState(0);
  const [totalUsersWithoutAccess, setTotalUsersWithoutAccess] = useState(0);

  useEffect(() => {
    fetchUsers();
    fetchRoles(); // Fetch roles when the component mounts
  }, []);

  // Fetch roles from the API
  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/roles`);
      setRoles(response.data); // Store roles from the backend
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
      setUsers(response.data.users);
      setTotalUsers(response.data.users.length);

      // Calculate totals for users with and without access
      const usersWithAccess = response.data.users.filter(user => user.access).length;
      const usersWithoutAccess = response.data.users.length - usersWithAccess;

      setTotalUsersWithAccess(usersWithAccess);
      setTotalUsersWithoutAccess(usersWithoutAccess);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const toSentenceCase = (str) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userId}`);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
  };

  const handleEditUser = async (editedUser) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${editedUser.id}`, editedUser);
      const updatedUser = response.data.user;
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleAccessChange = async (userId, newAccessValue) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, { access: newAccessValue });
      const updatedUser = response.data.user;
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
    } catch (error) {
      console.error('Error updating user access:', error);
    }
  };

  // Separate users based on access
  const usersWithAccess = users.filter(user => user.access);
  const usersWithoutAccess = users.filter(user => !user.access);

  // Sorting users by ID to keep a consistent order
  const sortedUsersWithAccess = [...usersWithAccess].sort((a, b) => a.id - b.id);
  const sortedUsersWithoutAccess = [...usersWithoutAccess].sort((a, b) => a.id - b.id);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-4">
        <h1 className="text-5xl font-extrabold text-black text-left px-4">
          User Management
        </h1>
      </div>

      <div className="px-4">
  {/* Total Users Section */}
  <div className="flex space-x-4 mb-6">
    {/* Total Users */}
    <div className="flex-1 bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center">
        <div className="bg-blue-100 rounded-full p-3 mr-4">
          <FontAwesomeIcon icon={faUsers} className="text-blue-500 text-xl" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-600">Total Users</h2>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalUsers}</p>
        </div>
      </div>
    </div>
    
    {/* Total Users with Access */}
    <div className="flex-1 bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center">
        <div className="bg-green-100 rounded-full p-3 mr-4">
          <FontAwesomeIcon icon={faUsers} className="text-green-500 text-xl" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-600">Users with Access</h2>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalUsersWithAccess}</p>
        </div>
      </div>
    </div>

    {/* Total Users without Access */}
    <div className="flex-1 bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center">
        <div className="bg-red-100 rounded-full p-3 mr-4">
          <FontAwesomeIcon icon={faUsers} className="text-red-500 text-xl" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-600">Users without Access</h2>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalUsersWithoutAccess}</p>
        </div>
      </div>
    </div>
  </div>
</div>


      <div className="px-4">
        {/* Users With Access Section */}
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Users with Access</h2>
        <div className="bg-white shadow-lg overflow-x-auto mb-6">
          <table className="min-w-full bg-white border-collapse">
            <thead className="bg-black text-[#FEC00F]">
              <tr>
                <th className="py-3 px-4 border-b text-center">No.</th>
                <th className="py-3 px-4 border-b text-center">Name</th>
                <th className="py-3 px-4 border-b text-center">Email</th>
                <th className="py-3 px-4 border-b text-center">Role</th>
                <th className="py-3 px-4 border-b text-center">Picture</th>
                <th className="py-3 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsersWithAccess.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                  <td className="py-2 px-4 border-b text-center">{toSentenceCase(user.name)}</td>

                  <td className="py-2 px-4 border-b text-center">{user.email}</td>
                  <td className="py-2 px-4 border-b text-center">{user.role}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full mx-auto" />
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600 transition duration-300"
                      onClick={() => handleEditClick(user)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Users Without Access Section */}
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Users without Access</h2>
        <div className="bg-white shadow-lg overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead className="bg-black text-[#FEC00F]">
              <tr>
                <th className="py-3 px-4 border-b text-center">No.</th>
                <th className="py-3 px-4 border-b text-center">Name</th>
                <th className="py-3 px-4 border-b text-center">Email</th>
                <th className="py-3 px-4 border-b text-center">Role</th>
                <th className="py-3 px-4 border-b text-center">Picture</th>
                <th className="py-3 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsersWithoutAccess.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50 transition duration-150">
                  <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                  <td className="py-2 px-4 border-b text-center">{user.name}</td>
                  <td className="py-2 px-4 border-b text-center">{user.email}</td>
                  <td className="py-2 px-4 border-b text-center">{user.role}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full mx-auto" />
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600 transition duration-300"
                      onClick={() => handleEditClick(user)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditUser(editingUser);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.role_name}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingUser.access}
                    onChange={(e) => setEditingUser({...editingUser, access: e.target.checked})}
                    className="form-checkbox h-5 w-5 text-blue-600 mr-2"
                  />
                  <label className="text-gray-700 text-sm font-bold">Access</label>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
