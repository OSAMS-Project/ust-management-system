import React from 'react';

const AssetRequestModal = ({ 
  isOpen, 
  onClose, 
  newAsset, 
  onInputChange, 
  onSubmit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Add Asset Request</h2>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="assetName"
            value={newAsset.assetName}
            onChange={onInputChange}
            placeholder="Asset Name"
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <input
            type="number"
            name="quantity"
            value={newAsset.quantity}
            onChange={onInputChange}
            placeholder="Quantity"
            className="w-full p-2 mb-2 border rounded"
            required
          />
          <textarea
            name="comments"
            value={newAsset.comments}
            onChange={onInputChange}
            placeholder="Add your comments here..."
            className="w-full p-2 mb-2 border rounded resize-none h-24"
          />
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetRequestModal;
