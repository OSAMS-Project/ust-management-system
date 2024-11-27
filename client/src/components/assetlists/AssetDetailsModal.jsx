import React, { useState } from 'react';
import moment from 'moment';
import AssetActivityLogs from './AssetActivityLogs';
import BorrowLogs from './BorrowLogs';
import RepairLogs from '../repair/RepairLogs';
import IssueLogs from '../issue/IssueLogs';
import MaintenanceLogs from '../maintenance/MaintenanceLogs';
import QRCodeModal from './QRCodeModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faQrcode } from "@fortawesome/free-solid-svg-icons";

const AssetDetailsModal = ({ selectedAsset, onClose }) => {
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [showBorrowLogs, setShowBorrowLogs] = useState(false);
  const [showRepairLogs, setShowRepairLogs] = useState(false);
  const [showIssueLogs, setShowIssueLogs] = useState(false);
  const [showMaintenanceLogs, setShowMaintenanceLogs] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  if (!selectedAsset) return null;

  const totalCost = parseFloat(selectedAsset.cost) * selectedAsset.quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95%] md:max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="text-lg sm:text-xl" />
        </button>

        <div className="p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">{selectedAsset.assetName}</h2>
          
          {selectedAsset.image && (
            <img 
              src={selectedAsset.image} 
              alt={selectedAsset.assetName} 
              className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-xl mb-4 sm:mb-6 shadow-md"
            />
          )}

          <div className="grid grid-cols-1 gap-y-3 sm:gap-y-4 md:grid-cols-2 md:gap-x-8">
            <DetailItem label="ID" value={selectedAsset.asset_id} />
            <DetailItem label="Product Code" value={selectedAsset.productCode} />
            <DetailItem label="Serial Number" value={selectedAsset.serialNumber} />
            <DetailItem label="Date Created" value={moment(selectedAsset.createdDate).format('MM/DD/YYYY')} />
            <DetailItem label="Quantity" value={selectedAsset.quantity} />
            <DetailItem label="Category" value={selectedAsset.category} />
            <DetailItem label="Location" value={selectedAsset.location} />
            <DetailItem label="Cost per Unit" value={`₱${parseFloat(selectedAsset.cost).toFixed(2)}`} />
            <DetailItem label="Total Cost" value={`₱${totalCost.toFixed(2)}`} />
            <DetailItem label="Type" value={selectedAsset.type} />
            <DetailItem label="Borrowing Status" value={selectedAsset.is_active ? "Active" : "Inactive"} />
            {selectedAsset.is_active && (
              <DetailItem 
                label="Quantity for Borrowing" 
                value={selectedAsset.quantity_for_borrowing || 'N/A'} 
              />
            )}
          </div>

          {/* Description Section */}
          <div className="mt-6 mb-6">
            <h3 className="font-semibold text-gray-600 text-sm sm:text-base mb-2">Description:</h3>
            <p className="text-gray-800 text-sm sm:text-base text-justify whitespace-pre-wrap break-words leading-relaxed">
              {selectedAsset.assetDetails || 'No description available'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setShowActivityLogs(true)}
              className="bg-green-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105 flex items-center justify-center"
            >
              View Activity Logs
            </button>

            {(selectedAsset.type === 'Non-Consumable' || (selectedAsset.type === 'Consumable' && selectedAsset.allow_borrowing)) && (
              <button
                onClick={() => setShowBorrowLogs(true)}
                className="bg-purple-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105 flex items-center justify-center"
              >
                Borrow Logs
              </button>
            )}

            {selectedAsset.type === 'Non-Consumable' && (
              <>
                <button
                  onClick={() => setShowMaintenanceLogs(true)}
                  className="bg-orange-500 text-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg shadow-md hover:bg-orange-600 transition-transform transform hover:scale-105 flex items-center justify-center"
                >
                  Maintenance Logs
                </button>
                <button
                  onClick={() => setShowRepairLogs(true)}
                  className="bg-yellow-500 text-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg shadow-md hover:bg-yellow-600 transition-transform transform hover:scale-105 flex items-center justify-center"
                >
                  Repair Logs
                </button>
                <button
                  onClick={() => setShowIssueLogs(true)}
                  className="bg-red-500 text-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-105 flex items-center justify-center"
                >
                  Issue Logs
                </button>
                <button
                  onClick={() => setShowQRCode(true)}
                  className="bg-blue-500 text-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faQrcode} className="mr-2" />
                  QR Code
                </button>
              </>
            )}

            {selectedAsset.type === 'Consumable' && (
              <button
                onClick={() => setShowQRCode(true)}
                className="bg-blue-500 text-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg shadow-md hover:bg-blue-600 transition-transform transform hover:scale-105 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faQrcode} className="mr-2" />
                QR Code
              </button>
            )}
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
        {showRepairLogs && (
          <RepairLogs
            assetId={selectedAsset.asset_id}
            onClose={() => setShowRepairLogs(false)}
          />
        )}
        {showIssueLogs && (
          <IssueLogs
            assetId={selectedAsset.asset_id}
            onClose={() => setShowIssueLogs(false)}
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
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 py-2 last:border-b-0">
    <span className="font-semibold text-gray-600 text-sm sm:text-base mb-1 sm:mb-0">{label}:</span>
    <span className="text-gray-800 sm:text-right text-sm sm:text-base">{value}</span>
  </div>
);

export default AssetDetailsModal;
