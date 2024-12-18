import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';

const ConsumeAssetModal = ({ isOpen, onClose, asset, onConfirm }) => {
  const [formData, setFormData] = useState({
    quantityToConsume: 1,
    reason: ''
  });
  const [error, setError] = useState('');

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate quantity
    if (formData.quantityToConsume > asset.quantity) {
      setError('Quantity to consume cannot exceed available quantity');
      return;
    }

    if (formData.quantityToConsume < 1) {
      setError('Quantity to consume must be at least 1');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason for consuming');
      return;
    }

    try {
      // Send consumption data to backend
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/assets/consume`, {
        assetId: asset.asset_id,
        quantityConsumed: formData.quantityToConsume,
        reason: formData.reason,
        consumedBy: 'System User' // You can get this from your auth system
      });

      // Call onConfirm with the updated data
      onConfirm({
        ...response.data.outgoingAsset,
        dateConsumed: new Date(),
        assetName: asset.assetName
      });

      // Reset form and close modal
      setFormData({ quantityToConsume: 1, reason: '' });
      setError('');
      onClose();
    } catch (error) {
      console.error('Consumption error:', error);
      setError(error.response?.data?.error || 'Failed to consume asset. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantityToConsume' ? Math.max(1, parseInt(value) || 0) : value
    }));
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="bg-[#FEC000] px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold text-black">Consume Asset</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Asset Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asset Name
            </label>
            <input
              type="text"
              value={asset.assetName}
              readOnly
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
          </div>

          {/* Available Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Quantity
            </label>
            <input
              type="text"
              value={asset.quantity}
              readOnly
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
          </div>

          {/* Quantity to Consume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Consume
            </label>
            <input
              type="number"
              name="quantityToConsume"
              value={formData.quantityToConsume}
              onChange={handleChange}
              min="1"
              max={asset.quantity}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Consuming
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide a reason for consuming this asset"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#FEC000] hover:bg-[#FEC000]/90"
            >
              Consume
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsumeAssetModal;
