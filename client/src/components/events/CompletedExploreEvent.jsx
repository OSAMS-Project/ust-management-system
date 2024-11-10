import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import axios from 'axios';

const CompletedExploreModal = ({ showExploreModal, selectedEvent, setShowExploreModal }) => {
  const [localAssets, setLocalAssets] = useState([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const fetchAssetCosts = async () => {
      if (selectedEvent && selectedEvent.completed_assets) {
        try {
          const assetsWithCosts = await Promise.all(
            selectedEvent.completed_assets.map(async (asset) => {
              try {
                console.log('Fetching cost for asset:', asset);
                const response = await axios.get(
                  `${process.env.REACT_APP_API_URL}/api/Events/asset-cost/${selectedEvent.unique_id}/${asset.asset_id}`
                );
                console.log('Cost response:', response.data);
                
                return {
                  ...asset,
                  cost: response.data.cost
                };
              } catch (error) {
                console.error(`Error fetching cost for asset ${asset.asset_id}:`, error.response || error);
                return asset;
              }
            })
          );

          console.log('Assets with costs:', assetsWithCosts);
          setLocalAssets(assetsWithCosts);

          // Calculate total
          const total = assetsWithCosts.reduce((sum, asset) => {
            const assetCost = parseFloat(asset.cost) || 0;
            const quantity = parseInt(asset.quantity) || 0;
            const subtotal = assetCost * quantity;
            console.log(`Calculating for ${asset.assetName}:`, {
              cost: assetCost,
              quantity: quantity,
              subtotal: subtotal
            });
            return sum + subtotal;
          }, 0);

          setTotalCost(total);
        } catch (error) {
          console.error('Error processing assets:', error);
        }
      }
    };

    fetchAssetCosts();
  }, [selectedEvent]);

  const memoizedAssetList = useMemo(() => {
    console.log('Rendering asset list with:', localAssets);
    return localAssets && localAssets.length > 0 ? (
      <ul className="list-disc pl-5">
        {localAssets.map((asset, index) => {
          const assetCost = parseFloat(asset.cost) || 0;
          console.log('Rendering asset with full details:', asset);
          
          return (
            <li key={index} className="mb-2 flex items-center justify-between">
              <span>
                <strong>{asset.assetName}</strong> - Quantity: {asset.quantity} - {' '}
                Cost per unit: ₱{assetCost.toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>
    ) : (
      <p>No assets used in this event.</p>
    );
  }, [localAssets]);

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
  );
};

export default CompletedExploreModal;
