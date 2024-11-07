import React, { useState, useCallback } from "react";
import Button from "./Button";
import axios from "axios";

// Modal Component
const Modal = ({
  isOpen,
  onClose,
  onSaveLocation,
  locations = [],
  onDeleteLocation,
}) => {
  const [location, setLocation] = useState("");

  const handleSaveLocation = async () => {
    if (location.trim()) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/locations`,
          { locationName: location }
        );
        onSaveLocation(response.data.location_name);
        setLocation("");
        onClose();
      } catch (error) {
        console.error("Error adding location:", error.message);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        } else if (error.request) {
          console.error("No response received:", error.request);
        }
      }
    }
  };

  const handleDeleteLocation = async (loc) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/locations/${encodeURIComponent(
          loc
        )}`
      );
      onDeleteLocation(loc);
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add Location</h2>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter location name"
            />
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              Existing Locations
            </h3>
            <ul className="space-y-2">
              {locations.map((loc, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded"
                >
                  <span className="text-gray-800">{loc}</span>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition-colors duration-300"
                    onClick={() => handleDeleteLocation(loc)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-300"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
            onClick={handleSaveLocation}
          >
            Save Location
          </Button>
        </div>
      </div>
    </div>
  );
};

const AssetLocation = ({ onSaveLocation, onDeleteLocation, locations }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <div className="group-button">
      <Button
        onClick={handleOpenModal}
        className="bg-blue-400 border border-black text-black px-4 py-2 rounded hover:bg-blue-300 transition-colors duration-300"
      >
        <span className="text-black">Add Location</span>
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSaveLocation={onSaveLocation}
        locations={locations}
        onDeleteLocation={onDeleteLocation}
      />
    </div>
  );
};

export default AssetLocation;
