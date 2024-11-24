import React, { useState, useCallback } from "react";
import Button from "./Button";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import DeleteConfirmationModal from '../utils/DeleteConfirmationModal';

// Modal Component
const Modal = ({
  isOpen,
  onClose,
  onSaveLocation,
  locations = [],
  onDeleteLocation,
}) => {
  const [location, setLocation] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

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
        `${process.env.REACT_APP_API_URL}/api/locations/${encodeURIComponent(loc)}`
      );
      onDeleteLocation(loc);
      setDeleteModalOpen(false);
      setLocationToDelete(null);
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative">
      <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 1000 }}>
        <div className="fixed inset-0 bg-black bg-opacity-50"></div>
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-xl relative">
          <div className="bg-[#FEC000] px-6 py-4 rounded-t-[20px] border-b">
            <h2 className="text-xl font-semibold text-black">Add Location</h2>
          </div>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location name"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Existing Locations</h3>
              <div className="space-y-2">
                {locations.map((loc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card text-card-foreground transition-colors hover:bg-muted/50"
                  >
                    <span className="text-sm">{loc}</span>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        className="h-8 w-8 text-gray-500 hover:text-red-500 flex items-center justify-center"
                        onClick={() => {
                          setLocationToDelete(loc);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="h-4 w-4" />
                        <span className="sr-only">Delete location</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveLocation}
              className="px-4 py-2"
            >
              Save Location
            </Button>
          </div>
        </div>
      </div>
      <div style={{ zIndex: 1100 }}>
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => locationToDelete && handleDeleteLocation(locationToDelete)}
          message={`Are you sure you want to delete "${locationToDelete}"?`}
        />
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
        className="px-3 py-2 border-2 border-black text-black bg-blue-400 rounded-md hover:bg-blue-300 duration-300"
      >
        Add Location
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
