import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import NotificationPopup from '../utils/NotificationsPopup';

const ExploreModal = ({ showExploreModal, selectedEvent, setShowExploreModal, handleAddAsset, updateEventAssets, updateAssetQuantity, readOnly = false }) => {
  const [editingAsset, setEditingAsset] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [localAssets, setLocalAssets] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [notification, setNotification] = useState(null);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

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
      const validAssets = (selectedEvent.assets || []).filter(asset => asset && asset.asset_id);
      console.log('Valid assets:', validAssets);
      setLocalAssets(validAssets);
      
      const total = validAssets.reduce((sum, asset) => {
        const assetCost = parseFloat(asset.cost) || 0;
        const quantity = parseInt(asset.quantity) || 0;
        const subtotal = assetCost * quantity;
        return sum + subtotal;
      }, 0);
      
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
        
        // Basic validation
        if (isNaN(newQuantity) || newQuantity < 1) {
          showErrorNotification('Quantity must be at least 1');
          return;
        }

        // Calculate the quantity difference
        const quantityDifference = asset.quantity - newQuantity;
        
        // Get current main asset quantity
        const assetResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/Assets/${asset.asset_id}`
        );
        
        const currentMainQuantity = assetResponse.data.quantity;
        
        // Check if we have enough quantity available
        if (quantityDifference < 0) { // If we're trying to increase allocated quantity
          const additionalNeeded = Math.abs(quantityDifference);
          if (additionalNeeded > currentMainQuantity) {
            showErrorNotification(
              `Cannot allocate more than available quantity. Available: ${currentMainQuantity}`
            );
            return;
          }
        }

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/events/${selectedEvent.unique_id}/updateAssetQuantity`,
          {
            assetId: asset.asset_id,
            newQuantity: newQuantity,
            quantityDifference: quantityDifference
          }
        );

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
        showErrorNotification(
          error.response?.data?.error || 'Failed to update quantity'
        );
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
                      min="1"
                      className="w-16 px-1 border rounded"
                    />
                  ) : (
                    <span>Quantity: {
                      editingAsset && editingAsset.asset_id === asset.asset_id ? (
                        <input 
                          type="number" 
                          value={editQuantity} 
                          onChange={(e) => setEditQuantity(e.target.value)}
                          min="1"
                          className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-yellow-500"
                        />
                      ) : asset.quantity
                    }</span>
                  )
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
    // Create new document with landscape orientation for better layout
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    // Add some styling variables
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 8;
    let yPosition = margin;
  
    // Add header with background
    doc.setFillColor(255, 193, 7); // Yellow color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Add title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.text('Event Details', pageWidth/2, 25, { align: 'center' });
  
    yPosition = 50; // Start content below header
  
    // Add event basic info section with text wrapping
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 70, 'F'); // Increased height
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    yPosition += 10;
    
    // Two-column layout with better spacing and text wrapping
    const leftCol = margin + 5;
    const rightCol = pageWidth/2 + 10;
    const maxWidth = pageWidth/2 - margin - 15; // Maximum width for wrapped text
    
    // Left column with text wrapping
    doc.text('Event Information:', leftCol, yPosition);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    yPosition += lineHeight * 2;
    
    doc.text(`Event Name: ${selectedEvent.event_name}`, leftCol, yPosition, { maxWidth: maxWidth });
    yPosition += lineHeight * 1.5;
    
    // Handle long location text with wrapping
    const locationText = `Location: ${selectedEvent.event_location}`;
    const splitLocation = doc.splitTextToSize(locationText, maxWidth);
    doc.text(splitLocation, leftCol, yPosition);
    yPosition += splitLocation.length * lineHeight;
    
    doc.text(`Date: ${new Date(selectedEvent.event_date).toLocaleDateString()}`, leftCol, yPosition);
    
    // Right column (reset yPosition and add content)
    yPosition = yPosition - (splitLocation.length * lineHeight) - (lineHeight * 2); // Reset to top of info section
    doc.text(`Start Time: ${formatTime(selectedEvent.event_start_time)}`, rightCol, yPosition);
    yPosition += lineHeight;
    doc.text(`End Time: ${formatTime(selectedEvent.event_end_time)}`, rightCol, yPosition);
    yPosition += lineHeight;
    doc.text(`ID: ${selectedEvent.unique_id}`, rightCol, yPosition);

    // Adjust the following yPosition to account for potential wrapped text
    yPosition += Math.max(lineHeight * 2, splitLocation.length * lineHeight);
  
    // Description section
    yPosition += lineHeight * 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text('Description:', margin, yPosition);
    yPosition += lineHeight * 1;
    
    // Description box with adjusted positioning
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 20, 'F');
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    yPosition += 6;
    
    // Handle long descriptions with text wrapping
    const splitDescription = doc.splitTextToSize(selectedEvent.description || '', pageWidth - (margin * 2) - 10);
    doc.text(splitDescription, margin + 5, yPosition);
    
    // Adjust spacing after description box
    yPosition += Math.max(25, splitDescription.length * 6);
  
    // Assets section with adjusted spacing
    yPosition += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text('Event Assets', margin, yPosition);
    yPosition += lineHeight * 2; // Increased spacing before table header

    // Assets table header with more space
    doc.setFillColor(255, 193, 7);
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 10, 'F'); // Increased height of header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    yPosition += 7; // Adjusted position for header text
    doc.text('Asset Name', margin + 5, yPosition);
    doc.text('Quantity', pageWidth - margin - 30, yPosition);
  
    // Add space between header and first row
    yPosition += lineHeight * 1.5; // Increased spacing after header

    // Assets table content
    doc.setFont("helvetica", "normal");
    localAssets.forEach((asset) => {
      // Check if we need a new page
      if (yPosition > pageHeight - margin * 2) {
        doc.addPage();
        yPosition = margin;
        
        // Redraw the table header on new page with same spacing
        doc.setFillColor(255, 193, 7);
        doc.rect(margin, yPosition, pageWidth - (margin * 2), 10, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        yPosition += 7;
        doc.text('Asset Name', margin + 5, yPosition);
        doc.text('Quantity', pageWidth - margin - 30, yPosition);
        yPosition += lineHeight * 1.5; // Consistent spacing after header
        doc.setFont("helvetica", "normal");
      }

      // Add zebra striping with adjusted positioning
      if ((yPosition/lineHeight) % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 8, 'F');
      }
      doc.text(asset.assetName, margin + 5, yPosition);
      doc.text(asset.quantity.toString(), pageWidth - margin - 30, yPosition);
      yPosition += lineHeight * 1.2; // Slightly increased row spacing
    });
  
    // Check if total cost section needs a new page
    if (yPosition > pageHeight - margin * 4) {
      doc.addPage();
      yPosition = margin;
    }
  
    // Total cost section
    yPosition += lineHeight * 3;
    doc.setFillColor(240, 240, 240);
    doc.rect(pageWidth - margin - 80, yPosition - 8, 80, 20, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text('Total Cost:', pageWidth - margin - 75, yPosition);

    const formattedCost = `PHP ${totalCost.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    })}`;
    doc.text(formattedCost, pageWidth - margin - 75, yPosition + 8);
  
    // Add footer to each page
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth/2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        pageWidth/2,
        pageHeight - 20,
        { align: 'center' }
      );
    }
  
    // Save the PDF
    doc.save(`${selectedEvent.event_name}_details.pdf`);
  };

  if (!showExploreModal || !selectedEvent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto transform transition-all animate-fadeIn font-roboto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Event Details</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Event Details Section - Updated grid and description handling */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-700">Unique ID:</p>
                <p className="text-gray-600">{selectedEvent.unique_id}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Event Name:</p>
                <p className="text-gray-600">{selectedEvent.event_name}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Event Location:</p>
                <p className="text-gray-600">{selectedEvent.event_location}</p>
              </div>
              {/* Description moved to full width below */}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-700">Date:</p>
                <p className="text-gray-600">
                  {new Date(selectedEvent.event_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Created At:</p>
                <p className="text-gray-600">
                  {new Date(selectedEvent.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">Start Time:</p>
                  <p className="text-gray-600">{formatTime(selectedEvent.event_start_time)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">End Time:</p>
                  <p className="text-gray-600">{formatTime(selectedEvent.event_end_time)}</p>
                </div>
              </div>
            </div>

            {/* Description Section - Full width */}
            <div className="col-span-1 lg:col-span-2 bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-700 mb-2">Description:</p>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-600 whitespace-pre-wrap break-words">
                  {selectedEvent.description}
                </p>
              </div>
            </div>
          </div>

          {/* Assets Section */}
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Event Assets</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {localAssets && localAssets.length > 0 ? (
                <div className="space-y-3">
                  {localAssets.map((asset) => (
                    asset && asset.asset_id ? (
                      <div key={asset.asset_id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{asset.assetName}</p>
                            <span className="text-sm text-gray-500">
                              ({asset.productCode || 'N/A'})
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                            <span>Quantity: {
                              editingAsset && editingAsset.asset_id === asset.asset_id ? (
                                <input 
                                  type="number" 
                                  value={editQuantity} 
                                  onChange={(e) => setEditQuantity(e.target.value)}
                                  min="1"
                                  className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-yellow-500"
                                />
                              ) : asset.quantity
                            }</span>
                            <span>Cost per unit: ₱{asset.cost.toFixed(2)}</span>
                          </div>
                        </div>
                        {!readOnly && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAsset(asset)}
                              className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-medium hover:bg-yellow-600 transition-colors"
                            >
                              {editingAsset && editingAsset.asset_id === asset.asset_id ? 'Save' : 'Edit'}
                            </button>
                            <button
                              onClick={() => handleRemoveAsset(asset)}
                              className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No assets added to this event.</p>
              )}
            </div>
          </div>

          {/* Total Cost Section */}
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
            <h3 className="text-xl font-bold text-black">Total Cost</h3>
            <p className="text-2xl font-bold text-yellow-600">₱{totalCost.toLocaleString()}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
            <button
              onClick={() => setShowExploreModal(false)}
              className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
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
    </div>
  );
};

export default ExploreModal;
