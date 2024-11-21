import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEdit, faPlus, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import AssetSelectionDialog from './AssetSelectionDialog';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function EventCard({ item, handleExplore, handleComplete, handleEdit, formatTime, handleAddAsset, assets }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAssetDialog, setShowAssetDialog] = useState(false);
  const [refreshedAssets, setRefreshedAssets] = useState(assets);
  const [isLoading, setIsLoading] = useState(false);
  const [consumableDialog, setConsumableDialog] = useState(false);
  const [consumableAssets, setConsumableAssets] = useState([]);
  const [returnQuantities, setReturnQuantities] = useState({});

  const fetchLatestAssets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Assets/read`);
      console.log('Fetched assets:', response.data);
      setRefreshedAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setRefreshedAssets(assets);
    }
  };

  const openAssetDialog = async () => {
    setIsLoading(true);
    await fetchLatestAssets();
    setIsLoading(false);
    setShowAssetDialog(true);
  };

  const closeAssetDialog = () => setShowAssetDialog(false);

  const handleConfirmSelection = (selectedAssets) => {
    handleAddAsset(item, selectedAssets);
    setShowAssetDialog(false);
  };

  const handleEventComplete = async () => {
    try {
      // First, fetch both consumable and non-consumable assets for this event
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events/${item.unique_id}/assets`);
      const { consumables, nonConsumables } = response.data;
      
      setShowConfirmDialog(false); // Close confirmation dialog first

      if (consumables.length > 0) {
        // If there are consumables, show the dialog for unused consumables
        setConsumableAssets(consumables);
        const quantities = {};
        consumables.forEach(asset => {
          quantities[asset.asset_id] = 0;
        });
        setReturnQuantities(quantities);
        setConsumableDialog(true);
      } else if (nonConsumables.length > 0) {
        // If there are only non-consumables, return them automatically
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/events/${item.unique_id}/complete`, {
          returnQuantities: {},
          nonConsumables: nonConsumables
        });
        
        if (response.data.success) {
          toast.success('Event completed successfully');
          window.location.reload();
        }
      } else {
        // If no assets, just complete the event
        handleComplete(item.unique_id, {});
      }
    } catch (error) {
      console.error('Error handling event completion:', error);
      toast.error('Failed to complete event');
    }
  };

  const handleQuantityChange = (assetId, value) => {
    const asset = consumableAssets.find(a => a.asset_id === assetId);
    const numValue = parseInt(value) || 0;
    
    if (numValue >= 0 && numValue <= asset.quantity) {
      setReturnQuantities(prev => ({
        ...prev,
        [assetId]: numValue
      }));
    }
  };

  const handleConsumableSubmit = async () => {
    try {
      // Get non-consumable assets for this event
      const nonConsumablesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/events/${item.unique_id}/nonConsumables`);
      const nonConsumables = nonConsumablesResponse.data;

      // Submit both consumable returns and non-consumable returns
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/events/${item.unique_id}/complete`, {
        returnQuantities,
        nonConsumables
      });
      
      if (response.data.success) {
        toast.success('Event completed successfully');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error completing event:', error);
      toast.error('Failed to complete event');
    }
    setConsumableDialog(false);
    setShowConfirmDialog(false);
  };

  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg w-80 h-[32rem] group font-quicksand font-semibold">
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
          <h2 className="font-quicksand font-semibold text-yellow-400 text-4xl mb-4 text-center truncate">{item.event_name}</h2>
          <p className="text-base mb-4 line-clamp-3">{item.description}</p>
          <div className="text-sm space-y-2">
            <p className="font-semibold">Event Date: {new Date(item.event_date).toLocaleDateString()}</p>
            <p className="font-semibold">Event Time: {formatTime(item.event_start_time)} - {formatTime(item.event_end_time)}</p>
            <p className="font-semibold">Event Location: {item.event_location}</p>
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
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-auto z-50 font-quicksand font-semibold">
            <h2 className="text-lg font-bold mb-2 text-gray-800">Confirm Completion</h2>
            <p className="mb-4 text-sm text-gray-600">Are you sure you want to mark this event as completed?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm transition"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition"
                onClick={() => handleEventComplete()}
              >
                Confirm
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Consumable Return Dialog */}
      {consumableDialog && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-auto z-50 font-quicksand font-semibold">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Return Unused Consumables</h2>
              <button 
                onClick={() => setConsumableDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {consumableAssets.map(asset => (
                <div key={asset.asset_id} className="mb-4 p-4 border rounded-lg">
                  <p className="font-semibold">{asset.assetName}</p>
                  <p className="text-sm text-gray-600">Allocated: {asset.quantity}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-sm">Unused Quantity:</label>
                    <input
                      type="number"
                      min="0"
                      max={asset.quantity}
                      value={returnQuantities[asset.asset_id]}
                      onChange={(e) => handleQuantityChange(asset.asset_id, e.target.value)}
                      className="border rounded px-2 py-1 w-20"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm transition"
                onClick={() => setConsumableDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition"
                onClick={handleConsumableSubmit}
              >
                Complete Event
              </button>
            </div>
          </div>
        </>
      )}

      {/* Asset Selection Dialog */}
      <AssetSelectionDialog
        isOpen={showAssetDialog}
        onClose={closeAssetDialog}
        assets={refreshedAssets.length > 0 ? refreshedAssets : assets}
        onConfirmSelection={handleConfirmSelection}
        eventName={item.event_name}
        isLoading={isLoading}
      />
    </div>
  );
}

export default EventCard;
