import React, { useState } from 'react';
import moment from 'moment';
import AssetActivityLogs from './assetactivitylogs';
import BorrowLogs from './BorrowLogs';
import MaintenanceLogs from '../maintenance/MaintenanceLogs';
const AssetDetailsModal = ({ selectedAsset, onClose }) => {
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [showBorrowLogs, setShowBorrowLogs] = useState(false);
  const [showMaintenanceLogs, setShowMaintenanceLogs] = useState(false);

  if (!selectedAsset) return null;

  const totalCost = parseFloat(selectedAsset.cost) * selectedAsset.quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{selectedAsset.assetName}</h2>
          
          {selectedAsset.image && (
            <img 
              src={selectedAsset.image} 
              alt={selectedAsset.assetName} 
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}

          <div className="space-y-3">
            <DetailItem label="ID" value={selectedAsset.asset_id} />
            <DetailItem label="Date Created" value={moment(selectedAsset.createdDate).format('MM/DD/YYYY')} />
            <DetailItem label="Quantity" value={selectedAsset.quantity} />
            <DetailItem label="Description" value={selectedAsset.assetDetails} />
            <DetailItem label="Category" value={selectedAsset.category} />
            <DetailItem label="Location" value={selectedAsset.location} />
            <DetailItem label="Cost per Unit" value={`₱${parseFloat(selectedAsset.cost).toFixed(2)}`} />
            <DetailItem label="Total Cost" value={`₱${totalCost.toFixed(2)}`} />
            <DetailItem label="Type" value={selectedAsset.type} />
            <DetailItem label="Status" value={selectedAsset.is_active ? "Active" : "Inactive"} />
            {selectedAsset.is_active && (
              <DetailItem 
                label="Quantity for Borrowing" 
                value={selectedAsset.quantity_for_borrowing || 'N/A'} 
              />
            )}
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
            >
              Close
            </button>
            <button
              onClick={() => setShowActivityLogs(true)}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300"
            >
              View Activity Logs
            </button>
            <button
              onClick={() => setShowBorrowLogs(true)}
              className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-300"
            >
              Borrow Logs
            </button>
            <button
              onClick={() => setShowMaintenanceLogs(true)}
              className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-300"
            >
              Maintenance Logs
            </button>
          </div>
        </div>
      </div>
      {showActivityLogs && (
        <AssetActivityLogs
          assetId={selectedAsset.asset_id}
          onClose={() => setShowActivityLogs(false)}
        />
      )}
      {showBorrowLogs && (
        <BorrowLogs
          assetId={selectedAsset.asset_id}
          onClose={() => setShowBorrowLogs(false)}
        />
      )}
      {showMaintenanceLogs && (
        <MaintenanceLogs
          assetId={selectedAsset.asset_id}
          onClose={() => setShowMaintenanceLogs(false)}
        />
      )}
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 py-2 last:border-b-0">
    <span className="font-semibold text-gray-600">{label}:</span>
    <span className="text-gray-800 sm:text-right">{value}</span>
  </div>
);

export default AssetDetailsModal;
