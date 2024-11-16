import React, { useState } from 'react';

const AssetSelectionDialog = ({ isOpen, onClose, assets, onConfirmSelection }) => {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [quantityInput, setQuantityInput] = useState('');
  const [currentAsset, setCurrentAsset] = useState(null);
  const [previewQuantities, setPreviewQuantities] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

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
    setSelectedAssets(selectedAssets.filter(asset => asset.asset_id !== assetToRemove.asset_id));
    
    setPreviewQuantities(prev => ({
      ...prev,
      [assetToRemove.asset_id]: undefined
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Select Assets</h3>
        
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="max-h-60 overflow-y-auto mb-4">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.asset_id} 
              className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              onClick={() => handleAssetClick(asset)}
            >
              <span>{asset.assetName}</span>
              <span className="text-sm text-gray-500">
                Available Quantity: {previewQuantities[asset.asset_id] !== undefined ? previewQuantities[asset.asset_id] : asset.quantity}
              </span>
            </div>
          ))}
          {filteredAssets.length === 0 && (
            <div className="p-2 text-center text-gray-500">
              No assets found
            </div>
          )}
        </div>
        {currentAsset && (
          <form onSubmit={handleQuantitySubmit} className="mb-4">
            <label className="block mb-2">
              Quantity for {currentAsset.assetName}:
              <input 
                type="number" 
                value={quantityInput} 
                onChange={(e) => setQuantityInput(e.target.value)}
                max={currentAsset.quantity}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
          </form>
        )}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Selected Assets:</h4>
          {selectedAssets.map((asset) => (
            <div key={asset.asset_id} className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded">
              <span>{asset.assetName}</span>
              <div className="flex items-center gap-2">
                <span>Quantity: {asset.selectedQuantity}</span>
                <button
                  onClick={() => handleRemoveSelectedAsset(asset)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={handleConfirmSelection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={selectedAssets.length === 0}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetSelectionDialog;
