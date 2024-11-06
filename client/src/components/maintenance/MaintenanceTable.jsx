import React, { useState } from 'react';
import AssetDetailsModal from '../assetlists/AssetDetailsModal';

const MaintenanceTable = ({ maintenanceRecords, assets = [], onCompleteRecord, onRemoveRecord }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);

  const handleRowClick = (assetId) => {
    if (!assets) return;
    
    const asset = assets.find(a => a.asset_id === assetId);
    if (asset) {
      setSelectedAsset(asset);
    }
  };

  const handleComplete = async (record) => {
    try {
      await onCompleteRecord(record.id);
      // Asset will automatically return to asset list through the backend updates
    } catch (error) {
      console.error('Error completing maintenance record:', error);
    }
  };

  if (!maintenanceRecords) return null;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Asset</th>
            <th className="px-4 py-2 text-left">Maintenance Type</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Maintenance Date</th>
            <th className="px-4 py-2 text-left">Cost</th>
            <th className="px-4 py-2 text-left">Performed By</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {maintenanceRecords
            .filter(record => record.status !== 'Completed')
            .map((record) => {
              const assetName = assets?.find(a => a.asset_id === record.asset_id)?.assetName || record.asset_id;
              
              return (
                <tr 
                  key={record.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(record.asset_id)}
                >
                  <td className="px-4 py-2">{assetName}</td>
                  <td className="px-4 py-2">{record.maintenance_type}</td>
                  <td className="px-4 py-2">{record.description}</td>
                  <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">₱{typeof record.cost === 'number' ? record.cost.toFixed(2) : record.cost}</td>
                  <td className="px-4 py-2">{record.performed_by}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleComplete(record)}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      Complete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click when clicking buttons
                        onRemoveRecord(record.id);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {selectedAsset && (
        <AssetDetailsModal
          selectedAsset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

export default MaintenanceTable;
