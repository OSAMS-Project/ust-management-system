import React from 'react';

const RoleManagement = () => {
  return (
    <div>
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-4">
        <h1 className="text-5xl font-extrabold text-black text-left px-4">
          Role Management
        </h1>
      </div>

      {/* Role Add Section */}
      <div className="px-4 my-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Add New Role</h2>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Role Name"
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
              Add Role
            </button>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="px-4">
        <div className="bg-white shadow-lg overflow-x-auto">
          <table className="min-w-full bg-white border-collapse">
            <thead className="bg-black text-[#FEC00F]">
              <tr>
                <th className="py-3 px-4 border-b text-center">Role Name</th>
                <th className="py-3 px-4 border-b text-center">User Picture</th>
              </tr>
            </thead>
            <tbody>
              {/* Example roles, this can be replaced with dynamic data */}
              <tr className="hover:bg-gray-50 transition duration-150">
                <td className="py-2 px-4 border-b text-center">Admin</td>
                <td className="py-2 px-4 border-b text-center">
                  <img
                    src="https://via.placeholder.com/40"
                    alt="User"
                    className="w-10 h-10 rounded-full mx-auto"
                  />
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition duration-150">
                <td className="py-2 px-4 border-b text-center">Editor</td>
                <td className="py-2 px-4 border-b text-center">
                  <img
                    src="https://via.placeholder.com/40"
                    alt="User"
                    className="w-10 h-10 rounded-full mx-auto"
                  />
                </td>
              </tr>
              {/* More rows can be added here */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
