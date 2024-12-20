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
                  cost: response.data.cost,
                  productCode: response.data.productCode
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

    // Add event basic info section
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 65, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    yPosition += 10;
    
    // Two-column layout for basic info
    const leftCol = margin + 5;
    const rightCol = pageWidth/2 + 10;
    
    // Left column
    doc.text('Event Information:', leftCol, yPosition);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    yPosition += lineHeight * 2;
    doc.text(`Event Name: ${selectedEvent.event_name}`, leftCol, yPosition);
    yPosition += lineHeight;
    doc.text(`Location: ${selectedEvent.event_location}`, leftCol, yPosition);
    yPosition += lineHeight;
    doc.text(`Date: ${new Date(selectedEvent.event_date).toLocaleDateString()}`, leftCol, yPosition);
    
    // Right column (reset yPosition)
    yPosition -= lineHeight * 2;
    doc.text(`Start Time: ${selectedEvent.event_start_time}`, rightCol, yPosition);
    yPosition += lineHeight;
    doc.text(`End Time: ${selectedEvent.event_end_time}`, rightCol, yPosition);
    yPosition += lineHeight;
    doc.text(`ID: ${selectedEvent.unique_id}`, rightCol, yPosition);

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

    // Assets section
    yPosition += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text('Event Assets', margin, yPosition);
    yPosition += lineHeight;

    // Assets table header
    doc.setFillColor(255, 193, 7);
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    yPosition += 6;
    doc.text('Asset Name', margin + 5, yPosition);
    doc.text('Quantity', pageWidth - margin - 30, yPosition);

    // Assets table content with pagination
    doc.setFont("helvetica", "normal");
    localAssets.forEach((asset) => {
      // Check if we need a new page
      if (yPosition > pageHeight - margin * 2) {
        // Add a new page
        doc.addPage();
        // Reset yPosition to top of new page
        yPosition = margin;
        
        // Redraw the table header on new page
        doc.setFillColor(255, 193, 7);
        doc.rect(margin, yPosition, pageWidth - (margin * 2), 8, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        yPosition += 6;
        doc.text('Asset Name', margin + 5, yPosition);
        doc.text('Quantity', pageWidth - margin - 30, yPosition);
        yPosition += lineHeight;
        doc.setFont("helvetica", "normal");
      }

      // Add zebra striping
      if ((yPosition/lineHeight) % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 8, 'F');
      }
      doc.text(asset.assetName, margin + 5, yPosition);
      doc.text(asset.quantity.toString(), pageWidth - margin - 30, yPosition);
      yPosition += lineHeight;
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
          {/* Event Details Section */}
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
                  <p className="text-gray-600">{selectedEvent.event_start_time}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">End Time:</p>
                  <p className="text-gray-600">{selectedEvent.event_end_time}</p>
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
                  {localAssets.map((asset, index) => {
                    const assetCost = parseFloat(asset.cost) || 0;
                    
                    return (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{asset.assetName}</p>
                            <span className="text-sm text-gray-500">
                              ({asset.productCode || 'N/A'})
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                            <span>Quantity: {asset.quantity}</span>
                            <span>Cost per unit: ₱{assetCost.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No assets used in this event.</p>
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
    </div>
  );
};

export default CompletedExploreModal;
