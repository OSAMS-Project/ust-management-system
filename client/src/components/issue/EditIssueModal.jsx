import React, { useState } from 'react';

const EditIssueModal = ({ isOpen, onClose, onEditIssue, issue, assets }) => {
  const [editData, setEditData] = useState({
    issue_type: issue.issue_type || '',
    description: issue.description || '',
    priority: issue.priority || '',
    issue_quantity: issue.issue_quantity || 1,
  });

  const selectedAsset = assets.find(a => a.asset_id === issue.asset_id);
  
  const maxAllowedQuantity = selectedAsset ? selectedAsset.quantity : 1;

  const issueTypes = [
    'Hardware Malfunction',
    'Damage',
    'Performance Problem',
    'Other'
  ];

  const priorityLevels = [
    'Low',
    'Medium',
    'High',
    'Critical'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'issue_quantity') {
      const numValue = parseInt(value) || 0;
      const validValue = Math.min(Math.max(1, numValue), maxAllowedQuantity);

      setEditData(prev => ({
        ...prev,
        [name]: validValue
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editData.issue_quantity < 1 || editData.issue_quantity > maxAllowedQuantity) {
      alert('Invalid quantity selected');
      return;
    }
    
    onEditIssue(issue.id, editData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all animate-fadeIn font-roboto">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Edit Issue</h2>
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

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Asset
              </label>
              <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 flex justify-between items-center">
                <span>
                  {assets.find(a => a.asset_id === issue.asset_id)?.assetName || ''}
                </span>
                {assets.find(a => a.asset_id === issue.asset_id)?.productCode && 
                 assets.find(a => a.asset_id === issue.asset_id)?.productCode !== 'N/A' && (
                  <span className="text-sm text-gray-600">
                    Product Code: {assets.find(a => a.asset_id === issue.asset_id)?.productCode}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Issue Type
              </label>
              <select
                name="issue_type"
                value={editData.issue_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              >
                <option value="">Select Issue Type</option>
                {issueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Priority Level
              </label>
              <select
                name="priority"
                value={editData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              >
                <option value="">Select Priority</option>
                {priorityLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Quantity
              </label>
              <input
                type="number"
                name="issue_quantity"
                value={editData.issue_quantity}
                onChange={handleInputChange}
                min="1"
                max={maxAllowedQuantity}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <p className="text-sm text-gray-600">
                Maximum available: {maxAllowedQuantity}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={editData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[120px]"
                required
              />
            </div>

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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditIssueModal; 