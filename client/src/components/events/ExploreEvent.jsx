import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import NotificationPopup from '../utils/NotificationsPopup';

const ExploreModal = ({ showExploreModal, selectedEvent, setShowExploreModal, handleAddAsset, updateEventAssets, updateAssetQuantity }) => {
  const [editingAsset, setEditingAsset] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [localAssets, setLocalAssets] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [notification, setNotification] = useState(null);

  const showSuccessNotification = (message) => {
    setNotification({
      type: 'success',
      message: message
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const showErrorNotification = (message) => {
    setNotification({
      type: 'error',
      message: message
    });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (selectedEvent) {
      console.log('Selected Event Assets:', selectedEvent.assets);
      setLocalAssets(selectedEvent.assets || []);
      const total = (selectedEvent.assets || []).reduce((sum, asset) => {
        console.log('Raw asset cost:', asset.cost);
        const assetCost = parseFloat(asset.cost) || 0;
        const quantity = parseInt(asset.quantity) || 0;
        const subtotal = assetCost * quantity;
        console.log('Asset calculation:', {
          name: asset.assetName,
          rawCost: asset.cost,
          parsedCost: assetCost,
          quantity: quantity,
          subtotal: subtotal
        });
        return sum + subtotal;
      }, 0);
      console.log('Final total:', total);
      setTotalCost(total);
    }
  }, [selectedEvent]);

  const handleRemoveAsset = async (asset) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/events/${selectedEvent.unique_id}/removeAsset`, {
        assetId: asset.asset_id,
        quantity: asset.quantity
      });

      if (response.data.success) {
        const updatedAssets = localAssets.filter(a => a.asset_id !== asset.asset_id);
        setLocalAssets(updatedAssets);
        updateEventAssets(selectedEvent.unique_id, updatedAssets);
        updateAssetQuantity(asset.asset_id, response.data.updatedAssetQuantity);
        showSuccessNotification('Asset removed successfully');
      }
    } catch (error) {
      console.error('Error removing asset:', error);
      showErrorNotification('Failed to remove asset. Please try again.');
    }
  };

  const handleEditAsset = async (asset) => {
    if (editingAsset && editingAsset.asset_id === asset.asset_id) {
      try {
        const newQuantity = parseInt(editQuantity);
        if (isNaN(newQuantity) || newQuantity < 0) {
          showErrorNotification('Please enter a valid quantity');
          return;
        }

        const quantityDifference = newQuantity - asset.quantity;
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/events/${selectedEvent.unique_id}/updateAssetQuantity`, {
          assetId: asset.asset_id,
          newQuantity: newQuantity,
          quantityDifference: quantityDifference
        });

        if (response.data.success) {
          const updatedAssets = localAssets.map(a => 
            a.asset_id === asset.asset_id ? { ...a, quantity: newQuantity } : a
          );
          setLocalAssets(updatedAssets);
          updateEventAssets(selectedEvent.unique_id, updatedAssets);
          updateAssetQuantity(asset.asset_id, response.data.updatedAssetQuantity);
          showSuccessNotification('Asset quantity updated successfully');
        }
      } catch (error) {
        console.error('Error updating asset quantity:', error);
        showErrorNotification('Failed to update asset quantity');
      }
      setEditingAsset(null);
      setEditQuantity('');
    } else {
      setEditingAsset(asset);
      setEditQuantity(asset.quantity.toString());
    }
  };

  const memoizedAssetList = useMemo(() => (
    localAssets && localAssets.length > 0 ? (
      <ul className="list-disc pl-5">
        {localAssets.map((asset) => {
          const assetCost = asset.cost ? parseFloat(asset.cost) : 0;
          
          return (
            <li key={asset.asset_id} className="mb-2 flex items-center justify-between">
              <span>
                <strong>{asset.assetName}</strong> - Quantity: {
                  editingAsset && editingAsset.asset_id === asset.asset_id ? (
                    <input 
                      type="number" 
                      value={editQuantity} 
                      onChange={(e) => setEditQuantity(e.target.value)}
                      className="w-16 px-1 border rounded"
                    />
                  ) : asset.quantity
                } - {' '}
                Cost per unit: ₱{assetCost.toFixed(2)}
              </span>
              <div>
                <button
                  onClick={() => handleEditAsset(asset)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-sm"
                >
                  {editingAsset && editingAsset.asset_id === asset.asset_id ? 'Save' : 'Edit'}
                </button>
                <button
                  onClick={() => handleRemoveAsset(asset)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    ) : (
      <p>No assets added to this event.</p>
    )
  ), [localAssets, editingAsset, editQuantity]);

  const memoizedTotalCost = useMemo(() => {
    return (
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-semibold">Total Cost:</h3>
        <p className="text-2xl text-green-600">₱{totalCost.toLocaleString()}</p>
      </div>
    );
  }, [totalCost]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const lineHeight = 10;
    let yPosition = 20;

    doc.setFontSize(18);
    doc.text('Event Details', 20, yPosition);
    yPosition += lineHeight * 2;

    doc.setFontSize(12);
    doc.text(`Unique ID: ${selectedEvent.unique_id}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Event Name: ${selectedEvent.event_name}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Event Location: ${selectedEvent.event_location}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Description: ${selectedEvent.description}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Date: ${new Date(selectedEvent.event_date).toLocaleDateString()}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Created At: ${new Date(selectedEvent.created_at).toLocaleDateString()}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`Start Time: ${selectedEvent.event_start_time}`, 20, yPosition);
    yPosition += lineHeight;
    doc.text(`End Time: ${selectedEvent.event_end_time}`, 20, yPosition);
    yPosition += lineHeight * 2;

    doc.setFontSize(14);
    doc.text('Event Assets:', 20, yPosition);
    yPosition += lineHeight;

    doc.setFontSize(12);
    localAssets.forEach((asset) => {
      doc.text(`${asset.assetName} - Quantity: ${asset.quantity}`, 30, yPosition);
      yPosition += lineHeight;
    });

    doc.setFontSize(14);
    doc.text('Total Cost:', 20, yPosition);
    yPosition += lineHeight;
    doc.setFontSize(12);
    doc.text(`₱${totalCost.toLocaleString()}`, 30, yPosition);
    yPosition += lineHeight * 2;

    doc.save(`${selectedEvent.event_name}_details.pdf`);
  };

  if (!showExploreModal || !selectedEvent) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-50 rounded-md">
        <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowExploreModal(false)}></div>
        <div className="relative bg-white p-6 rounded-md shadow-lg z-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl mb-4">Event Details</h2>
          <p><strong>Unique ID:</strong> {selectedEvent.unique_id}</p>
          <p><strong>Event Name:</strong> {selectedEvent.event_name}</p>
          <p><strong>Event Location:</strong> {selectedEvent.event_location}</p>
          <p><strong>Description:</strong> {selectedEvent.description}</p>
          <p><strong>Date:</strong> {new Date(selectedEvent.event_date).toLocaleDateString()}</p>
          <p><strong>Created At:</strong> {new Date(selectedEvent.created_at).toLocaleDateString()}</p>
          <p><strong>Start Time:</strong> {selectedEvent.event_start_time}</p>
          <p><strong>End Time:</strong> {selectedEvent.event_end_time}</p>
          
          <h3 className="text-xl mt-4 mb-2">Event Assets:</h3>
          {memoizedAssetList}
          
          {memoizedTotalCost}
          
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setShowExploreModal(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
      
      {notification && (
        <NotificationPopup
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default ExploreModal;
