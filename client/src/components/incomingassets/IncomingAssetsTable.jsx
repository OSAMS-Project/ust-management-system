import React from 'react';
import moment from 'moment';

const IncomingAssetsTable = ({ 
  assets = [],
  handleStatusUpdate, 
  currentPage = 1,
  setCurrentPage, 
  itemsPerPage = 5,
  receivedAssets = [],
  currentReceivedAssets = [],
  currentPendingAssets = []
}) => {
  const pendingAssets = assets.filter(asset => asset.status !== 'received');

  return (
    <div className="overflow-x-auto">
      {/* Pending Assets Table */}
      <div className="mt-2">
        <h2 className="text-2xl font-bold mb-4">Pending Assets ({pendingAssets.length})</h2>
        <table className="min-w-full bg-white border-collapse">
          <thead className="bg-black text-[#FEC00F]">
            <tr>
              <th className="py-2 px-4 border-b text-center">Asset Name</th>
              <th className="py-2 px-4 border-b text-center">Type</th>
              <th className="py-2 px-4 border-b text-center">Category</th>
              <th className="py-2 px-4 border-b text-center">Quantity</th>
              <th className="py-2 px-4 border-b text-center">Total Cost</th>
              <th className="py-2 px-4 border-b text-center">Expected Date</th>
              <th className="py-2 px-4 border-b text-center">Status</th>
              <th className="py-2 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPendingAssets.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-4 text-center text-gray-500">
                  No pending assets found
                </td>
              </tr>
            ) : (
              currentPendingAssets.map((asset, index) => (
                <tr
                  key={asset.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
                  } cursor-pointer hover:bg-gray-50`}
                >
                  <td className="py-2 px-4 border-b text-center">{asset.assetName}</td>
                  <td className="py-2 px-4 border-b text-center">{asset.type}</td>
                  <td className="py-2 px-4 border-b text-center">{asset.category}</td>
                  <td className="py-2 px-4 border-b text-center">{asset.quantity}</td>
                  <td className="py-2 px-4 border-b text-center">₱{asset.total_cost}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {moment(asset.expected_date).format("MM/DD/YYYY")}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      onClick={() => handleStatusUpdate(asset)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition duration-300"
                    >
                      Mark as Received
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Received Assets Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Received Assets ({receivedAssets.length})</h2>
        <table className="min-w-full bg-white border-collapse">
          <thead className="bg-black text-[#FEC00F]">
            <tr>
              <th className="py-2 px-4 border-b text-center">Asset Name</th>
              <th className="py-2 px-4 border-b text-center">Type</th>
              <th className="py-2 px-4 border-b text-center">Category</th>
              <th className="py-2 px-4 border-b text-center">Quantity</th>
              <th className="py-2 px-4 border-b text-center">Total Cost</th>
              <th className="py-2 px-4 border-b text-center">Status</th>
              <th className="py-2 px-4 border-b text-center">Location</th>
              <th className="py-2 px-4 border-b text-center">Received Date</th>
            </tr>
          </thead>
          <tbody>
            {currentReceivedAssets.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-4 text-center text-gray-500">
                  No received assets yet
                </td>
              </tr>
            ) : (
              currentReceivedAssets.map((asset, index) => (
                <tr
                  key={asset.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
                  } cursor-pointer hover:bg-gray-50`}
                >
                  <td className="py-2 px-4 border-b text-center">{asset.assetName}</td>
                  <td className="py-2 px-4 border-b text-center">{asset.type}</td>
                  <td className="py-2 px-4 border-b text-center">{asset.category}</td>
                  <td className="py-2 px-4 border-b text-center">{asset.quantity}</td>
                  <td className="py-2 px-4 border-b text-center">₱{asset.total_cost}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-center">{asset.location}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {moment(asset.updated_at).format("MM/DD/YYYY")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-end">
        <nav className="flex items-center space-x-2">
          {Array.from({ length: Math.ceil(assets.length / itemsPerPage) }).map((_, index) => (
            <button
              key={index}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </nav>
      </div> 
    </div>
  );
};

export default IncomingAssetsTable;