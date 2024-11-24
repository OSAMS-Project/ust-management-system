import React from 'react';
import ReactDOM from 'react-dom';

const AssetRequestModal = ({ 
  isOpen, 
  onClose, 
  newAsset, 
  onInputChange, 
  onSubmit 
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Dark overlay with bg-opacity-80 */}
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      
      {/* Modal content */}
      <div className="fixed inset-0 flex justify-center items-center z-[1000] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto transform transition-all animate-fadeIn font-roboto">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">Add Asset Request</h2>
              <button
                onClick={onClose}
                className="text-black hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Asset Name</label>
                  <input
                    type="text"
                    name="assetName"
                    value={newAsset.assetName}
                    onChange={onInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    placeholder="Enter asset name"
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={newAsset.quantity}
                    onChange={onInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    min="1"
                    required
                    placeholder="Enter quantity"
                    autoComplete="off"
                  />
                </div>

                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Comments</label>
                  <textarea
                    name="comments"
                    value={newAsset.comments}
                    onChange={onInputChange}
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Add your comments here..."
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
                >
                  Add Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default AssetRequestModal;
