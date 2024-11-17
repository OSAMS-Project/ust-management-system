import React, { useState } from 'react';

const AssetSelectionDialog = ({ isOpen, onClose, assets, onConfirmSelection }) => {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [quantityInput, setQuantityInput] = useState('');
  const [currentAsset, setCurrentAsset] = useState(null);
  const [previewQuantities, setPreviewQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  if (!isOpen) return null;

  const filteredAssets = assets.filter(asset =>
    asset.assetName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssetClick = (asset) => {
    setCurrentAsset(asset);
    setQuantityInput('');
  };

  const handleQuantitySubmit = (e) => {
    e.preventDefault();
    if (currentAsset && quantityInput) {
      const selectedQuantity = parseInt(quantityInput);
      const availableQuantity = previewQuantities[currentAsset.asset_id] !== undefined 
        ? previewQuantities[currentAsset.asset_id] 
        : currentAsset.quantity;

      // Validate if enough quantity is available
      if (selectedQuantity > availableQuantity) {
        alert('Selected quantity exceeds available assets');
        return;
      }

      const existingAssetIndex = selectedAssets.findIndex(asset => asset.asset_id === currentAsset.asset_id);
      if (existingAssetIndex !== -1) {
        const updatedAssets = [...selectedAssets];
        updatedAssets[existingAssetIndex].selectedQuantity += selectedQuantity;
        setSelectedAssets(updatedAssets);
      } else {
        setSelectedAssets([...selectedAssets, { ...currentAsset, selectedQuantity }]);
      }

      // Update preview quantities
      setPreviewQuantities(prev => ({
        ...prev,
        [currentAsset.asset_id]: availableQuantity - selectedQuantity
      }));
      
      setCurrentAsset(null);
      setQuantityInput('');
    }
  };

  const handleConfirmSelection = () => {
    onConfirmSelection(selectedAssets);
    setSelectedAssets([]);
  };

  const handleClose = () => {
    setSelectedAssets([]);
    setCurrentAsset(null);
    setQuantityInput('');
    onClose();
    setPreviewQuantities({});
  };

  const handleRemoveSelectedAsset = (assetToRemove) => {
    setSelectedAssets(prevAssets => {
      const updatedAssets = prevAssets.filter(asset => asset.asset_id !== assetToRemove.asset_id);
      
      // Calculate if current page will be empty after removal
      const startIndex = (currentPage - 1) * itemsPerPage;
      const itemsInCurrentPage = updatedAssets.slice(startIndex, startIndex + itemsPerPage);
      
      // If current page will be empty and we're not on the first page, go to previous page
      if (itemsInCurrentPage.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      return updatedAssets;
    });
    
    setPreviewQuantities(prev => ({
      ...prev,
      [assetToRemove.asset_id]: undefined
    }));
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = selectedAssets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(selectedAssets.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="relative mx-auto p-0 border w-[32rem] shadow-2xl rounded-2xl bg-white transform transition-all animate-fadeIn font-roboto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Select Assets</h2>
            <button
              onClick={handleClose}
              className="text-black hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Assets List */}
          <div className="max-h-60 overflow-y-auto mb-4 rounded-lg border border-gray-200">
            {filteredAssets.map((asset) => (
              <div 
                key={asset.asset_id} 
                className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b last:border-b-0 transition-colors"
                onClick={() => handleAssetClick(asset)}
              >
                <span className="font-medium">{asset.assetName}</span>
                <span className="text-sm text-gray-600">
                  Available: {previewQuantities[asset.asset_id] !== undefined ? previewQuantities[asset.asset_id] : asset.quantity}
                </span>
              </div>
            ))}
            {filteredAssets.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No assets found
              </div>
            )}
          </div>

          {/* Quantity Input Form */}
          {currentAsset && (
            <form onSubmit={handleQuantitySubmit} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <label className="block mb-2 font-medium">
                Quantity for {currentAsset.assetName}:
                <input 
                  type="number" 
                  value={quantityInput} 
                  onChange={(e) => setQuantityInput(e.target.value)}
                  max={currentAsset.quantity}
                  min="1"
                  className="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </label>
              <button 
                type="submit" 
                className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
              >
                Add
              </button>
            </form>
          )}

          {/* Selected Assets */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Selected Assets:</h4>
            <div className="space-y-2">
              {currentItems.map((asset) => (
                <div key={asset.asset_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{asset.assetName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">Qty: {asset.selectedQuantity}</span>
                    <button
                      onClick={() => handleRemoveSelectedAsset(asset)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {selectedAssets.length > itemsPerPage && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      currentPage === index + 1
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedAssets.length === 0}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors disabled:opacity-50"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetSelectionDialog;
