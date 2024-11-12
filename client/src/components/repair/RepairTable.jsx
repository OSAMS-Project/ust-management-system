import React, { useState } from 'react';
import AssetDetailsModal from '../assetlists/AssetDetailsModal';
import moment from 'moment';

const RepairTable = ({ repairRecords, assets = [], onCompleteRecord, onRemoveRecord, onViewLogs }) => {
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
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Asset</th>
            <th className="px-4 py-2 text-left">Repair Type</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Quantity</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Cost</th>
            <th className="px-4 py-2 text-left">Performed By</th>
            <th className="px-4 py-2 text-left">Actions</th>
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
                  <td className="px-4 py-2">{assetName}</td>
                  <td className="px-4 py-2">{record.repair_type}</td>
                  <td className="px-4 py-2">{record.description}</td>
                  <td className="px-4 py-2">
                    <span className="font-medium">{record.repair_quantity}</span>
                  </td>
                  <td className="px-4 py-2">{moment(record.date).format('MM/DD/YYYY')}</td>
                  <td className="px-4 py-2">₱{record.cost}</td>
                  <td className="px-4 py-2">{record.performed_by}</td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => handleComplete(e, record)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                      >
                        Complete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewLogs(record.asset_id);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        View Logs
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
