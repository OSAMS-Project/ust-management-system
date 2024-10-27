// ./components/users/EditUser.jsx

import React from 'react';

const EditUser = ({ user, roles, onChange, onSubmit, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative p-8 border w-full max-w-lg shadow-xl rounded-lg bg-white">
        <h3 className="text-xl font-semibold leading-6 text-gray-800 mb-6 border-b pb-4">Edit User</h3>
        <form onSubmit={onSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={user.name}
                onChange={(e) => onChange({ ...user, name: e.target.value })}
                className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user.email}
                onChange={(e) => onChange({ ...user, email: e.target.value })}
                className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-1" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                value={user.role}
                onChange={(e) => onChange({ ...user, role: e.target.value })}
                className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.role_name}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={user.access}
                onChange={(e) => onChange({ ...user, access: e.target.checked })}
                className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mr-3"
              />
              <label className="text-gray-600 text-sm font-medium">Access</label>
            </div>
          </div>
          <div className="flex items-center justify-between mt-8 space-x-4">
          <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 px-4 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
            >
              Cancel
            </button>
          
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
