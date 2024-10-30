import React, { useState } from 'react';
import moment from 'moment';
import AssetActivityLogs from './assetactivitylogs';
import BorrowLogs from './BorrowLogs';
import MaintenanceLogs from '../maintenance/MaintenanceLogs';
import QRCodeModal from './QRCodeModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faQrcode } from "@fortawesome/free-solid-svg-icons";

const AssetDetailsModal = ({ selectedAsset, onClose }) => {
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [showBorrowLogs, setShowBorrowLogs] = useState(false);
  const [showMaintenanceLogs, setShowMaintenanceLogs] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  if (!selectedAsset) return null;

  const totalCost = parseFloat(selectedAsset.cost) * selectedAsset.quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">{selectedAsset.assetName}</h2>
          
          {selectedAsset.image && (
            <img 
              src={selectedAsset.image} 
              alt={selectedAsset.assetName} 
              className="w-full h-64 object-cover rounded-xl mb-6 shadow-md"
            />
          )}

          <div className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-8">
            <DetailItem label="ID" value={selectedAsset.asset_id} />
            <DetailItem label="Product Code" value={selectedAsset.productCode} />
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

          <div className="flex justify-between gap-4 mt-8">
            <button
              onClick={() => setShowActivityLogs(true)}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105"
            >
              View Activity Logs
            </button>
            <button
              onClick={() => setShowBorrowLogs(true)}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105"
            >
              Borrow Logs
            </button>
            <button
              onClick={() => setShowMaintenanceLogs(true)}
              className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition-transform transform hover:scale-105"
            >
              Maintenance Logs
            </button>
            <button
              onClick={() => setShowQRCode(true)}
              className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faQrcode} className="mr-2" />
              QR Code
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
      {showQRCode && (
        <QRCodeModal
          assetId={selectedAsset.asset_id}
          assetName={selectedAsset.assetName}
          onClose={() => setShowQRCode(false)}
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
