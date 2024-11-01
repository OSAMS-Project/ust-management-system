import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import AssetSelectionDialog from './assetselectiondialog';

function EventCard({ item, handleExplore, handleComplete, handleEdit, formatTime, handleAddAsset, assets }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAssetDialog, setShowAssetDialog] = useState(false);

  const openAssetDialog = () => setShowAssetDialog(true);
  const closeAssetDialog = () => setShowAssetDialog(false);

  const handleConfirmSelection = (selectedAssets) => {
    handleAddAsset(item, selectedAssets);
    setShowAssetDialog(false);
  };

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg w-80 h-[32rem] group">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundImage: `url(${item.image || '/ust-image.JPG'})` }}
      ></div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 group-hover:bg-opacity-70"></div>
      
      {/* Content */}
      <div className="relative flex flex-col justify-between p-6 text-white h-full">
        <div className="flex-grow">
          <h2 className="font-bold text-yellow-400 text-3xl mb-4 text-center truncate">{item.event_name}</h2>
          <p className="text-sm mb-4 line-clamp-3">{item.description}</p>
          <div className="text-xs space-y-2">
            <p>Event Date: {new Date(item.event_date).toLocaleDateString()}</p>
            <p>Event Time: {formatTime(item.event_start_time)} - {formatTime(item.event_end_time)}</p>
            <p>Event Location: {item.event_location}</p>
          </div>
        </div>

        {/* Button Row */}
        <div className="flex justify-around items-center mt-8 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Explore Button */}
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-purple-700 text-white rounded-lg transition-all duration-300 w-10 hover:w-32"
            onClick={() => handleExplore(item)}
          >
            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
            <span className="ml-2 overflow-hidden transition-all duration-300 whitespace-nowrap">Explore</span>
          </button>

          {/* Edit Button */}
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg transition-all duration-300 w-10 hover:w-24"
            onClick={() => handleEdit(item)}
          >
            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
            <span className="ml-2 overflow-hidden transition-all duration-300 whitespace-nowrap">Edit</span>
          </button>

          {/* Add Asset Button */}
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg transition-all duration-300 w-10 hover:w-32"
            onClick={openAssetDialog}
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            <span className="ml-2 overflow-hidden transition-all duration-300 whitespace-nowrap">Allocate</span>
          </button>

          {/* Complete Button */}
          <button 
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg transition-all duration-300 w-10 hover:w-32"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmDialog(true);
            }}
          >
            <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
            <span className="ml-2 overflow-hidden transition-all duration-300 whitespace-nowrap">Complete</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50" 
            onClick={() => setShowConfirmDialog(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-auto z-50">
            <h2 className="text-lg font-bold mb-2 text-gray-800">Confirm Completion</h2>
            <p className="mb-4 text-sm text-gray-600">Are you sure you want to mark this event as completed?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmDialog(false);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition"
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete(item.unique_id);
                  setShowConfirmDialog(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      )}

      {/* Asset Selection Dialog */}
      <AssetSelectionDialog
        isOpen={showAssetDialog}
        onClose={closeAssetDialog}
        assets={assets}
        onConfirmSelection={handleConfirmSelection}
        eventName={item.event_name}
      />
    </div>
  );
}

export default EventCard;
