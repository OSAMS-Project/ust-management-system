import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faUsers, faSearch } from '@fortawesome/free-solid-svg-icons';
import EditUser from '../components/users/EditUser';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // State for storing available roles
  const [currentTab, setCurrentTab] = useState('ALL'); // State for current tab
  const [editingUser, setEditingUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalUsersWithAccess, setTotalUsersWithAccess] = useState(0);
  const [totalUsersWithoutAccess, setTotalUsersWithoutAccess] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''); // Search input state
  const [selectedRole, setSelectedRole] = useState(''); // Role filter state

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
  const sortedUsers = [...users].sort((a, b) => a.id - b.id);
  const sortedUsersWithAccess = [...usersWithAccess].sort((a, b) => a.id - b.id);
  const sortedUsersWithoutAccess = [...usersWithoutAccess].sort((a, b) => a.id - b.id);

  // Filtered users based on search query and role filter
  const filteredUsers = (currentTab === 'ALL' ? sortedUsers : currentTab === 'WITH_ACCESS' ? sortedUsersWithAccess : sortedUsersWithoutAccess)
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole ? user.role === selectedRole : true;
      return matchesSearch && matchesRole;
    });

  const renderTableContent = () => (
    <tbody>
      {filteredUsers.map((user, index) => (
        <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#E8E8E8]'}`}>
          <td className="py-2 px-4 border-b text-center">{index + 1}</td>
          <td className="py-2 px-4 border-b text-center">
            <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full mx-auto" />
          </td>
          <td className="py-2 px-4 border-b text-center">{toSentenceCase(user.name)}</td>
          <td className="py-2 px-4 border-b text-center">{user.email}</td>
          <td className="py-2 px-4 border-b text-center">{user.role}</td>
          {currentTab === 'ALL' && (
            <td className="py-2 px-4 border-b text-center">
              <span
                className={`inline-block px-3 py-1 rounded-full text-white text-sm font-semibold ${
                  user.access ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {user.access ? 'With Access' : 'No Access'}
              </span>
            </td>
          )}
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
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
  <h1 className="text-5xl font-extrabold text-black">
    User Management
  </h1>
  <FontAwesomeIcon 
    icon={faUsers} 
    className="text-black text-5xl transform" 
  />
</div>


      <div className="px-4">
      <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full px-5 py-1 text-center uppercase tracking-wider mb-3">
  User Summary
</div>


        {/* Total Users Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Users */}
      <div className="bg-yellow-400 p-6 rounded-lg shadow-md flex items-center justify-center h-48 bg-cover bg-center relative overflow-hidden" style={{backgroundImage: "url('ust-img-3.JPG')"}}>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-7xl font-bold text-yellow-400">
              {totalUsers}
            </h2>
            <p className="text-2xl font-semibold text-white mt-2">Total Users</p>
          </div>
        </div>
          
          {/* Total Users with Access */}
        <div className="bg-yellow-400 p-6 rounded-lg shadow-md flex items-center justify-center h-48 bg-cover bg-center relative overflow-hidden" style={{backgroundImage: "url('ust-img-2.JPG')"}}>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-7xl font-bold text-yellow-400">
            {totalUsersWithAccess}
            </h2>
            <p className="text-2xl font-semibold text-white mt-2">Users with Access</p>
          </div>
        </div>

          {/* Total Users without Access */}
        <div className="bg-yellow-400 p-6 rounded-lg shadow-md flex items-center justify-center h-48 bg-cover bg-center relative overflow-hidden" style={{backgroundImage: "url('ust-img-1.JPG')"}}>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-7xl font-bold text-yellow-400">
            {totalUsersWithoutAccess}
            </h2>
            <p className="text-2xl font-semibold text-white mt-2">Users without Access</p>
          </div>
        </div>


          
        </div>
      </div>

      {/* Tabs and Search/Filter Section */}
      <div className="px-4 mb-6 flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            className={`px-6 py-2 rounded-lg focus:outline-none ${currentTab === 'ALL' ? 'bg-[#FEC00F] text-black' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setCurrentTab('ALL')}
          >
            ALL
          </button>
          <button
            className={`px-6 py-2 rounded-lg focus:outline-none ${currentTab === 'WITH_ACCESS' ? 'bg-[#FEC00F] text-black' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setCurrentTab('WITH_ACCESS')}
          >
            With Access
          </button>
          <button
            className={`px-6 py-2 rounded-lg focus:outline-none ${currentTab === 'WITHOUT_ACCESS' ? 'bg-[#FEC00F] text-black' : 'bg-gray-200 text-gray-600'}`}
            onClick={() => setCurrentTab('WITHOUT_ACCESS')}
          >
            Pending Access
          </button>
        </div>

        <div className="flex space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-gray-500"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-3 text-gray-400 " />
          </div>

          {/* Role Filter Dropdown */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:border-gray-500"
          >
            <option value="">Filter by Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.role_name}>
                {role.role_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4">
        {/* User Table Section */}
        <div className="bg-white overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead className="bg-black text-[#FEC00F]">
              <tr>
                <th className="py-2 px-4 border-b text-center">#</th>
                <th className="py-2 px-4 border-b text-center">Picture</th>
                <th className="py-2 px-4 border-b text-center">Name</th>
                <th className="py-2 px-4 border-b text-center">Email</th>
                <th className="py-2 px-4 border-b text-center">Role</th>
                {currentTab === 'ALL' && <th className="py-2 px-4 border-b text-center">Status</th>}
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            {renderTableContent()}
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUser
          user={editingUser}
          roles={roles}
          onChange={setEditingUser}
          onSubmit={(e) => {
            e.preventDefault();
            handleEditUser(editingUser);
          }}
          onCancel={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;
