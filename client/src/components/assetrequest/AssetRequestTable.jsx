import React from 'react';
import moment from 'moment';

const AssetRequestTable = ({ assetRequests, onApprove, onDecline }) => {
  return (
    <div className="mt-2">
      <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
      <table className="min-w-full bg-white border-collapse">
        <thead className="bg-black text-[#FEC00F]">
          <tr>
            <th className="py-2 px-4 border-b text-center">Asset Name</th>
            <th className="py-2 px-4 border-b text-center">Quantity</th>
            <th className="py-2 px-4 border-b text-center">Date Created</th>
            <th className="py-2 px-4 border-b text-center">Created By</th>
            <th className="py-2 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assetRequests.map((asset, index) => (
            <tr
              key={index}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
              } cursor-pointer hover:bg-gray-50`}
            >
              <td className="py-2 px-4 border-b text-center">{asset.asset_name}</td>
              <td className="py-2 px-4 border-b text-center">{asset.quantity}</td>
              <td className="py-2 px-4 border-b text-center">
                {moment(asset.created_at).format("MM/DD/YYYY")}
              </td>
              <td className="py-2 px-4 border-b text-center">
                <div className="flex items-center justify-center">
                  <img 
                    src={asset.user_picture || "https://via.placeholder.com/30"} 
                    alt={asset.created_by} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  {asset.created_by}
                </div>
              </td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  onClick={() => onApprove(asset.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded mr-2 text-xs hover:bg-green-600 transition duration-300"
                >
                  Approve
                </button>
                <button
                  onClick={() => onDecline(asset.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition duration-300"
                >
                  Decline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetRequestTable;