import React, { useState } from 'react';
import AssetDetailsModal from '../assetlists/AssetDetailsModal';
import moment from 'moment';

const RepairTable = ({ repairRecords, assets = [], onCompleteRecord, onRemoveRecord }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);

  const handleRowClick = (assetId) => {
    const asset = assets?.find(a => a.asset_id === assetId);
    if (asset) {
      setSelectedAsset(asset);
    }
  };

  const handleComplete = (e, record) => {
    e.stopPropagation();
    if (record && record.id) {
      onCompleteRecord(record);
    } else {
      console.error('Invalid repair record:', record);
    }
  };

  if (!repairRecords) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-black">
          <tr>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Asset</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Repair Type</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Description</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Quantity</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Date</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Cost</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Performed By</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {repairRecords
            .filter(record => record.status !== 'Completed')
            .map((record) => {
              const assetName = assets?.find(a => a.asset_id === record.asset_id)?.assetName || record.asset_id;
              return (
                <tr
                  key={record.id}
                  onClick={() => handleRowClick(record.asset_id)}
                  className="hover:bg-gray-50 cursor-pointer border-b"
                >
                  <td className="px-4 py-2 text-center">{assetName}</td>
                  <td className="px-4 py-2 text-center">{record.repair_type}</td>
                  <td className="px-4 py-2 text-center">{record.description}</td>
                  <td className="px-4 py-2 text-center">
                    <span className="font-medium">{record.repair_quantity}</span>
                  </td>
                  <td className="px-4 py-2 text-center">{moment(record.date).format('MM/DD/YYYY')}</td>
                  <td className="px-4 py-2 text-center">₱{record.cost}</td>
                  <td className="px-4 py-2 text-center">{record.performed_by}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => handleComplete(e, record)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Complete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      {repairRecords.filter(record => record.status !== 'Completed').length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No pending repair records found
        </div>
      )}
    </div>
  );
};

export default RepairTable;
