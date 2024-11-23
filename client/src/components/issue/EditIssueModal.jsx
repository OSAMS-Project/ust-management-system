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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Edit Issue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Asset
              </label>
              <input
                type="text"
                value={assets.find(a => a.asset_id === issue.asset_id)?.assetName || ''}
                className="w-full px-3 py-2 border rounded-md bg-gray-100"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Issue Type
              </label>
              <select
                name="issue_type"
                value={editData.issue_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Issue Type</option>
                {issueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Priority Level
              </label>
              <select
                name="priority"
                value={editData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Priority</option>
                {priorityLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quantity
              </label>
              <input
                type="number"
                name="issue_quantity"
                value={editData.issue_quantity}
                onChange={handleInputChange}
                min="1"
                max={maxAllowedQuantity}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-600">
                Maximum available: {maxAllowedQuantity}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description
              </label>
              <textarea
                name="description"
                value={editData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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