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
    if (window.confirm('Are you sure you want to complete this repair record?')) {
      onCompleteRecord(record.id);
    }
  };

  if (!repairRecords) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Asset</th>
            <th className="px-4 py-2 text-left">Repair Type</th>
            <th className="px-4 py-2 text-left">Description</th>
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
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2">{assetName}</td>
                  <td className="px-4 py-2">{record.repair_type}</td>
                  <td className="px-4 py-2">{record.description}</td>
                  <td className="px-4 py-2">{moment(record.date).format('MM/DD/YYYY')}</td>
                  <td className="px-4 py-2">₱{record.cost}</td>
                  <td className="px-4 py-2">{record.performed_by}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={(e) => handleComplete(e, record)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                    >
                      Complete
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default RepairTable;
