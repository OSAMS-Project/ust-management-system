import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IssueModal = ({ isOpen, onClose, onAddIssue, assets, user }) => {
  const [issueData, setIssueData] = useState({
    asset_id: '',
    issue_type: '',  // This should match the backend field name
    description: '',
    priority: '',
    reported_by: user?.name || '',  // Set the current user's name
    user_picture: user?.picture || '' // Set the current user's picture
  });

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
    setIssueData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Debug log
    console.log('Updated issue data:', {
      ...issueData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Include the user information in the submission
      await onAddIssue({
        ...issueData,
        reported_by: user?.name,
        user_picture: user?.picture
      });
      onClose();
    } catch (error) {
      console.error('Error submitting issue:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <select
            name="asset_id"
            value={issueData.asset_id}
            onChange={(e) => setIssueData({ ...issueData, asset_id: e.target.value })}
            required
          >
            <option value="">Select Asset</option>
            {assets.map(asset => (
              <option key={asset.asset_id} value={asset.asset_id}>
                {asset.assetName}
              </option>
            ))}
          </select>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Type
            </label>
            <select
              name="issue_type"
              value={issueData.issue_type}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="">Select Issue Type</option>
              {issueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Level
            </label>
            <select
              name="priority"
              value={issueData.priority}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="">Select Priority</option>
              {priorityLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={issueData.description}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2 h-32"
              required
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Submit Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueModal;
