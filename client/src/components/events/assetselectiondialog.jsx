import React, { useState } from 'react';

const AssetSelectionDialog = ({ isOpen, onClose, assets, onConfirmSelection }) => {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [quantityInput, setQuantityInput] = useState('');
  const [currentAsset, setCurrentAsset] = useState(null);


  if (!isOpen) return null;
  const handleAssetClick = (asset) => {
    setCurrentAsset(asset);
    setQuantityInput('');
  };

  const handleQuantitySubmit = (e) => {
    e.preventDefault();
    if (currentAsset && quantityInput) {
      setSelectedAssets([...selectedAssets, { ...currentAsset, selectedQuantity: parseInt(quantityInput) }]);
      setCurrentAsset(null);
      setQuantityInput('');
    }
  };

  const handleConfirmSelection = () => {
    onConfirmSelection(selectedAssets);
    setSelectedAssets([]);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Select Assets</h3>
        <div className="max-h-60 overflow-y-auto mb-4">
          {assets.map((asset) => (
            <div 
              key={asset.asset_id} 
              className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              onClick={() => handleAssetClick(asset)}
            >
              <span>{asset.assetName}</span>
              <span className="text-sm text-gray-500">Available Assets: {asset.quantity}</span>
            </div>
          ))}
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
          {selectedAssets.map((asset, index) => (
            <div key={index} className="flex justify-between items-center">
              <span>{asset.assetName}</span>
              <span>Quantity: {asset.selectedQuantity}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
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