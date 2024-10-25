import React, { useState } from 'react';
import '../../pages/eventlist1.css';
import AssetSelectionDialog from './assetselectiondialog';

function EventCard({ item, handleExplore, handleComplete, handleEdit, formatTime, handleAddAsset, assets }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAssetDialog, setShowAssetDialog] = useState(false);



  const openAssetDialog = () => {
    setShowAssetDialog(true);
  };

  const closeAssetDialog = () => {
    setShowAssetDialog(false);
  };

  const handleConfirmSelection = (selectedAssets) => {
    console.log('Selected assets:', selectedAssets);
    handleAddAsset(item, selectedAssets);
    setShowAssetDialog(false);
  };

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg w-full sm:w-80 md:w-96 h-auto min-h-[16rem] sm:min-h-[20rem] group">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundImage: `url(${item.image || '/ust-image.JPG'})` }}
      ></div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 group-hover:bg-opacity-70"></div>
      
      {/* Content */}
      <div className="relative flex flex-col justify-between p-4 sm:p-6 text-white h-full">
        <div className="flex-grow">
          <h2 className="font-bold text-yellow-400 text-4xl mb-2 sm:mb-4 text-center truncate">{item.event_name}</h2>
          <p className="text-sm sm:text-base mb-2 sm:mb-4 line-clamp-3">{item.description}</p>
          <div className="text-xs sm:text-sm space-y-1 sm:space-y-2">
            <p>Event Date: {new Date(item.event_date).toLocaleDateString()}</p>
            <p>Event Time: {formatTime(item.event_start_time)} - {formatTime(item.event_end_time)}</p>
            <p>Event Location: {item.event_location}</p>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-wrap items-center mt-4 sm:mt-20 gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
          <button className="button flex-1 text-xs sm:text-sm py-1 sm:py-2" style={{"--clr": "#7808d0"}} onClick={() => handleExplore(item)}>
            <span className="button__icon-wrapper">
              <svg width="10" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="button__icon-svg">
                <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor"></path>
              </svg>
              <svg width="10" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="button__icon-svg button__icon-svg--copy">
                <path d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z" fill="currentColor"></path>
              </svg>
            </span>
            <span> Explore </span>
          </button>
          
          <button 
            className="p-1 sm:p-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors duration-300 editBtn flex-1"
            onClick={() => handleEdit(item)}
          >
            <svg height="1em" viewBox="0 0 512 512">
              <path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path>
            </svg>
          </button>
          
          <button 
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            onClick={() => {
              handleComplete(item.unique_id);
              setShowConfirmDialog(false);
            }}
          >
            Complete
          </button>

          <button 
            className="p-1 sm:p-2 bg-yellow-500 rounded hover:bg-black transition-colors duration-300 add-asset-button flex-1"
            onClick={openAssetDialog}
          >
            Add Asset
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <>
          <div className="confirmation-dialog-overlay" onClick={() => setShowConfirmDialog(false)}></div>
          <div className="confirmation-dialog w-11/12 max-w-md">
            <h2 className="text-lg font-bold mb-2">Confirm Completion</h2>
            <p className="mb-4 text-sm">Are you sure you want to mark this event as completed?</p>
            <div className="flex justify-end">
              <button
                className="mr-2 px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                onClick={() => {
                  handleComplete(item.unique_id);
                  setShowConfirmDialog(false);
                }}
              >
                Complete
              </button>
            </div>
          </div>
        </>
      )}
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
