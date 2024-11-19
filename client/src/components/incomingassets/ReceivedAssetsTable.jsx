import React from 'react';
import moment from 'moment';

const ReceivedAssetsTable = ({ 
  receivedAssets = [],
}) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Received Assets </h2>
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
          {receivedAssets.length === 0 ? (
            <tr>
              <td colSpan="8" className="py-4 text-center text-gray-500">
                No received assets yet
              </td>
            </tr>
          ) : (
            receivedAssets.map((asset, index) => (
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
  );
};

export default ReceivedAssetsTable; 