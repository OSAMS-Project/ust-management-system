import React, { useState } from "react";
import NotificationPopup from "../utils/NotificationsPopup";
import moment from "moment";
import "moment-timezone";

function BorrowSelectModal({
  isOpen,
  onClose,
  activeAssets,
  onSelectMaterials,
  expectedReturnDate,
}) {
  const [selectedAssets, setSelectedAssets] = useState({});
  const [dateToBeCollected, setDateToBeCollected] = useState(() => {
    const date = new Date();
    date.setHours(8, 0, 0, 0); // Set default time to 8:00 AM
    return date.toISOString().slice(0, 16);
  });

  const [notification, setNotification] = useState(null);

  function getPhilippinesDateTime() {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  }

  function formatDateTimeForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const handleDateTimeChange = (e) => {
    const selectedDateTime = new Date(e.target.value);
    const phNow = getPhilippinesDateTime();
    const returnDate = new Date(expectedReturnDate);

    // Check if the selected day is Saturday (6) or Sunday (0)
    const dayOfWeek = selectedDateTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setNotification({
        type: "error",
        message: "Please select a weekday (Monday to Friday)",
      });
      return;
    }

    // Set hours to 0 for fair date comparison
    const selectedDate = new Date(selectedDateTime);
    selectedDate.setHours(0, 0, 0, 0);
    const returnDateOnly = new Date(returnDate);
    returnDateOnly.setHours(0, 0, 0, 0);

    // Check if time is within office hours (8 AM to 5 PM)
    const hours = selectedDateTime.getHours();
    const minutes = selectedDateTime.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    const startOfDay = 8 * 60; // 8:00 AM in minutes
    const endOfDay = 17 * 60; // 5:00 PM in minutes

    if (timeInMinutes < startOfDay || timeInMinutes > endOfDay) {
      setNotification({
        type: "error",
        message: "Please select a time between 8:00 AM and 5:00 PM",
      });
      return;
    }

    if (selectedDateTime < phNow) {
      setNotification({
        type: "error",
        message: "Collection date and time cannot be in the past",
      });
      return;
    }

    if (selectedDate >= returnDateOnly) {
      setNotification({
        type: "error",
        message:
          "Collection date must be earlier than the expected return date",
      });
      return;
    }

    // If all validations pass, use the selected date and time
    setDateToBeCollected(e.target.value);
  };

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
        dateToBeCollected: moment(dateToBeCollected).format(
          "YYYY-MM-DDTHH:mm:ss"
        ),
      }))
    );
    onClose();
  };

  const phNow = getPhilippinesDateTime();
  const minDateTime = formatDateTimeForInput(phNow);

  if (!isOpen) return null;

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
                Date and Time to be Collected (8:00 AM - 5:00 PM)
              </label>
              <input
                type="datetime-local"
                value={moment(dateToBeCollected)
                  .tz("Asia/Manila")
                  .format("YYYY-MM-DDTHH:mm")} // Format for `datetime-local`
                onChange={handleDateTimeChange}
                min={moment()
                  .tz("Asia/Manila")
                  .startOf("day")
                  .add(8, "hours")
                  .format("YYYY-MM-DDTHH:mm")} // Minimum value is 8:00 AM Manila time today
                step="60"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {activeAssets
              .filter((asset) => asset.quantity_for_borrowing > 0)
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
