import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

const ExploreModal = ({ showExploreModal, selectedEvent, setShowExploreModal, handleAddAsset, updateEventAssets, updateAssetQuantity }) => {
  const [editingAsset, setEditingAsset] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [localAssets, setLocalAssets] = useState([]);

  useEffect(() => {
    if (selectedEvent) {
      setLocalAssets(selectedEvent.assets || []);
    }
  }, [selectedEvent]);

  const handleRemoveAsset = async (asset) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/events/${selectedEvent.unique_id}/removeAsset`, {
        assetId: asset.asset_id,
        quantity: asset.quantity
      });

      if (response.data.success) {
        // Update the event's assets locally
        const updatedAssets = localAssets.filter(a => a.asset_id !== asset.asset_id);
        setLocalAssets(updatedAssets);
        updateEventAssets(selectedEvent.unique_id, updatedAssets);
        // Update the asset quantity in the AssetList component
        updateAssetQuantity(asset.asset_id, response.data.updatedAssetQuantity);
      }
    } catch (error) {
      console.error('Error removing asset:', error);
      if (error.response && error.response.status === 404) {
        alert('The remove asset endpoint is not available. Please check your backend implementation.');
      } else {
        alert('Failed to remove asset. Please try again.');
      }
    }
  };

  const handleEditAsset = async (asset) => {
    if (editingAsset && editingAsset.asset_id === asset.asset_id) {
      try {
        const newQuantity = parseInt(editQuantity);
        if (isNaN(newQuantity) || newQuantity < 0) {
          alert('Please enter a valid quantity');
          return;
        }

        const quantityDifference = newQuantity - asset.quantity;

        const response = await axios.post(`http://localhost:5000/api/events/${selectedEvent.unique_id}/updateAssetQuantity`, {
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
          
          // Update the overall asset quantity
          updateAssetQuantity(asset.asset_id, response.data.updatedAssetQuantity);
        } else {
          throw new Error(response.data.message || 'Failed to update asset quantity');
        }
      } catch (error) {
        console.error('Error updating asset quantity:', error);
        if (error.response) {
          console.error('Server response:', error.response.data);
        }
        alert(`Error updating asset quantity: ${error.response?.data?.message || error.message}`);
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
        {localAssets.map((asset) => (
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
              }
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
        ))}
      </ul>
    ) : (
      <p>No assets selected for this event.</p>
    )
  ), [localAssets, editingAsset, editQuantity]);

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

    doc.save(`${selectedEvent.event_name}_details.pdf`);
  };

  if (!showExploreModal || !selectedEvent) return null;

  return (
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
  );
};

export default ExploreModal;
