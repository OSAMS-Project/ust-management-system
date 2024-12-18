import React from 'react';
import moment from 'moment';

const OutgoingAssetsTable = ({ outgoingAssets }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-black text-[#FEC00F] text-lg">
            <th className="text-center py-2 px-4">Date Consumed</th>
            <th className="text-center py-2 px-4">Asset Name</th>
            <th className="text-center py-2 px-4">Quantity Consumed</th>
            <th className="text-center py-2 px-4">Reason</th>
          </tr>
        </thead>
        <tbody>
          {outgoingAssets.map((item, index) => (
            <tr
              key={item.id}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
              } hover:bg-gray-100 transition-all duration-150 text-lg`}
            >
              <td className="text-center py-3">
                {moment(item.consumed_date).format("MM/DD/YYYY")}
              </td>
              <td className="text-center py-3">{item.assetName}</td>
              <td className="text-center py-3">{item.quantity}</td>
              <td className="text-center py-3">{item.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {outgoingAssets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-xl font-semibold">No consumed assets found</p>
        </div>
      )}
    </div>
  );
};

export default OutgoingAssetsTable; 