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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">Add Repair Record</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Asset
            </label>
            <input
              type="text"
              value={selectedAsset?.assetName || ''}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 cursor-not-allowed"
              readOnly
            />
            {/* Hidden input for asset_id */}
            <input
              type="hidden"
              name="asset_id"
              value={selectedAsset?.asset_id || selectedIssue?.asset_id || ''}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Quantity for Repair
            </label>
            <input
              type="number"
              name="repair_quantity"
              value={repairData.repair_quantity}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 cursor-not-allowed"
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="repairType">
              Repair Type
            </label>
            <select
              name="repairType"
              value={repairData.repairType}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select repair type</option>
              {repairTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              name="description"
              value={repairData.description}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Repair Date
            </label>
            <input
              type="date"
              name="date"
              value={repairData.date}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cost">
              Repair Cost
            </label>
            <input
              type="number"
              name="cost"
              value={repairData.cost}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="performedBy">
              Performed By
            </label>
            <input
              type="text"
              name="performedBy"
              value={repairData.performedBy}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Repair
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairModal;
