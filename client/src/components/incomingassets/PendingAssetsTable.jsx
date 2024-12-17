import React from 'react';
import moment from 'moment';

const PendingAssetsTable = ({ 
  pendingAssets = [], 
  handleStatusUpdate,
}) => {
  return (
    <div className="mt-2">
      <h2 className="text-2xl font-bold mb-4">Pending Assets</h2>
      <table className="min-w-full bg-white border-collapse">
        <thead className="bg-black text-[#FEC00F]">
          <tr>
            <th className="py-2 px-4 border-b text-center">Asset Name</th>
            <th className="py-2 px-4 border-b text-center">Type</th>
            <th className="py-2 px-4 border-b text-center">Category</th>
            <th className="py-2 px-4 border-b text-center">Quantity</th>
            <th className="py-2 px-4 border-b text-center">Total Cost</th>
            <th className="py-2 px-4 border-b text-center">Supplier</th>
            <th className="py-2 px-4 border-b text-center">Expected Date of Arrival</th>
            <th className="py-2 px-4 border-b text-center">Status</th>
            <th className="py-2 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingAssets.length === 0 ? (
            <tr>
              <td colSpan="9" className="py-4 text-center text-gray-500">
                No pending assets found
              </td>
            </tr>
          ) : (
            pendingAssets.map((asset, index) => (
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
                  {asset.supplier || "N/A"}
                </td>
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
  );
};

export default PendingAssetsTable;
