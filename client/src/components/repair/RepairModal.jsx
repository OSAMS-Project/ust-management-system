import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RepairModal = ({ isOpen, onClose, onAddRepair, initialData = {}, selectedAsset, selectedIssue }) => {
  const [repairData, setRepairData] = useState({
    assetId: '',
    repairType: '',
    description: '',
    date: '',
    cost: '',
    performedBy: '',
    repair_quantity: 1,
    ...initialData
  });

  // Define repairTypes array
  const repairTypes = [
    'Hardware Repair',
    'Software Repair',
    'Component Replacement',
    'Calibration',
    'Emergency Repair',
    'Preventive Maintenance',
    'Diagnostic Check',
    'Cleaning',
    'Parts Upgrade'
  ];

  // Update repair data when modal opens or selected issue changes
  useEffect(() => {
    if (isOpen && selectedIssue && selectedAsset) {
      setRepairData(prev => ({
        ...prev,
        assetId: selectedAsset.asset_id || selectedIssue.asset_id,
        repair_quantity: parseInt(selectedIssue.issue_quantity) || 1,
        description: `Issue Report: ${selectedIssue.description || ''}`
      }));
    }
  }, [isOpen, selectedAsset, selectedIssue]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRepairData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedAsset?.asset_id && !selectedIssue?.asset_id) {
        throw new Error('Asset ID is required');
      }

      const selectedDate = new Date(repairData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

      if (selectedDate < today) {
        alert('Repair date cannot be in the past');
        return;
      }

      const formattedData = {
        asset_id: selectedAsset?.asset_id || selectedIssue?.asset_id,
        repair_type: repairData.repairType,
        description: repairData.description,
        date: repairData.date,
        cost: parseFloat(repairData.cost),
        performed_by: repairData.performedBy,
        quantity: repairData.repair_quantity,
        issue_id: selectedIssue?.id
      };

      console.log('Submitting repair data:', formattedData);

      if (typeof onAddRepair === 'function') {
        await onAddRepair(formattedData);
        setRepairData({
          assetId: '',
          repairType: '',
          description: '',
          date: '',
          cost: '',
          performedBy: '',
          repair_quantity: 1
        });
        onClose();
      } else {
        console.error('onAddRepair is not a function');
      }
    } catch (error) {
      console.error('Error submitting repair:', error);
      alert(error.message || 'Error submitting repair');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all animate-fadeIn font-roboto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Add Repair Record</h2>
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

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Asset
              </label>
              <input
                type="text"
                value={selectedAsset?.assetName || ''}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 cursor-not-allowed"
                readOnly
              />
              <input
                type="hidden"
                name="asset_id"
                value={selectedAsset?.asset_id || selectedIssue?.asset_id || ''}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Quantity for Repair
              </label>
              <input
                type="number"
                name="repair_quantity"
                value={repairData.repair_quantity}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 cursor-not-allowed"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Repair Type
              </label>
              <select
                name="repairType"
                value={repairData.repairType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              >
                <option value="">Select repair type</option>
                {repairTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={repairData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[120px]"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Repair Date
              </label>
              <input
                type="date"
                name="date"
                value={repairData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Repair Cost
              </label>
              <input
                type="number"
                name="cost"
                value={repairData.cost}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
              Office to perform repair
              </label>
              <input
                type="text"
                name="Office to perform repair"
                value={repairData.performedBy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
              >
                Add Repair
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RepairModal;
