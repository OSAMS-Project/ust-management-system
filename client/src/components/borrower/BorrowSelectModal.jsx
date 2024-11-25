import React, { useState } from "react";
import NotificationPopup from "../utils/NotificationsPopup";

function BorrowSelectModal({
  isOpen,
  onClose,
  activeAssets,
  onSelectMaterials,
}) {
  const [selectedAssets, setSelectedAssets] = useState({});
  const [dateToBeCollected, setDateToBeCollected] = useState(
    formatDateTimeForInput(new Date())
  );
  const [notification, setNotification] = useState(null);

  function getPhilippinesDateTime() {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  }

  function formatDateTimeForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const handleDateTimeChange = (e) => {
    const selectedDateTime = new Date(e.target.value);
    const phNow = getPhilippinesDateTime();
    
    if (selectedDateTime < phNow) {
      setNotification({
        type: 'error',
        message: 'Cannot select a past date and time'
      });
      return;
    }
    
    setDateToBeCollected(e.target.value);
  };

  if (!isOpen) return null;

  const handleQuantityChange = (assetId, value) => {
    const asset = activeAssets.find((asset) => asset.asset_id === assetId);
    const quantity = Math.max(
      1,
      Math.min(parseInt(value) || 0, asset.quantity_for_borrowing)
    );
    setSelectedAssets((prev) => ({
      ...prev,
      [assetId]: { ...asset, quantity },
    }));
  };

  const handleSelect = (asset) => {
    if (selectedAssets[asset.asset_id]) {
      const { [asset.asset_id]: _, ...rest } = selectedAssets;
      setSelectedAssets(rest);
    } else {
      setSelectedAssets((prev) => ({
        ...prev,
        [asset.asset_id]: { ...asset, quantity: 1 },
      }));
    }
  };

  const handleConfirm = () => {
    onSelectMaterials(
      Object.values(selectedAssets).map((asset) => ({
        ...asset,
        dateToBeCollected,
      }))
    );
    onClose();
  };

  const phNow = getPhilippinesDateTime();
  const minDateTime = formatDateTimeForInput(phNow);

  return (
    <>
      <NotificationPopup 
        notification={notification}
        onClose={() => setNotification(null)}
      />
      
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-3xl w-full">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
            Select Assets to Borrow
          </h2>
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date and Time to be Collected
              </label>
              <input
                type="datetime-local"
                value={dateToBeCollected}
                onChange={handleDateTimeChange}
                min={minDateTime}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {activeAssets
              .filter(asset => asset.quantity_for_borrowing > 0)
              .map((asset) => (
              <div
                key={asset.asset_id}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  <p className="font-bold text-lg text-gray-800">
                    {asset.assetName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Available for borrowing:{" "}
                    <span className="font-semibold text-blue-600">
                      {asset.quantity_for_borrowing !== undefined
                        ? asset.quantity_for_borrowing
                        : "N/A"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedAssets[asset.asset_id] && (
                    <input
                      type="number"
                      min="0"
                      max={asset.quantity_for_borrowing}
                      value={selectedAssets[asset.asset_id]?.quantity || ""}
                      onChange={(e) =>
                        handleQuantityChange(asset.asset_id, e.target.value)
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                    />
                  )}
                  <button
                    className={`px-4 py-2 rounded-full transition-colors duration-200 shadow-md hover:shadow-lg ${
                      selectedAssets[asset.asset_id]
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-yellow-500 hover:bg-yellow-600 text-white"
                    }`}
                    onClick={() => handleSelect(asset)}
                    disabled={asset.quantity_for_borrowing === 0}
                  >
                    {selectedAssets[asset.asset_id] ? "Remove" : "Select"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-between">
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-200 font-semibold"
              disabled={
                Object.keys(selectedAssets).length === 0 || !dateToBeCollected
              }
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default BorrowSelectModal;
