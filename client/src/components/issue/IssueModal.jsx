import React, { useState, useRef, useEffect } from 'react';

const IssueModal = ({ isOpen, onClose, onAddIssue, assets, user, issues = [] }) => {
  const [issueData, setIssueData] = useState({
    asset_id: '',
    issue_type: '',
    description: '',
    priority: '',
    quantity: 1,
    reported_by: user?.name || '',
    user_picture: user?.picture || ''
  });

  const [selectedAssetDetails, setSelectedAssetDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const availableAssets = assets.filter(asset => {
    const hasActiveIssue = issues.some(issue => 
      issue.asset_id === asset.asset_id && 
      issue.status !== 'Resolved' && 
      issue.status !== 'In Repair'
    );
    return !hasActiveIssue;
  });

  const filteredAssets = availableAssets.filter(asset => {
    const searchLower = searchTerm.toLowerCase();
    const assetNameMatch = asset.assetName.toLowerCase().includes(searchLower);
    const productCodeMatch = asset.productCode && 
                           asset.productCode !== 'N/A' && 
                           asset.productCode.toLowerCase().includes(searchLower);
    return assetNameMatch || productCodeMatch;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'quantity') {
      const numValue = parseInt(value) || 0;
      const maxQuantity = selectedAssetDetails?.quantity || 0;
      const validValue = Math.min(Math.max(0, numValue), maxQuantity);
      
      setIssueData(prev => ({
        ...prev,
        [name]: validValue
      }));
    } else {
      setIssueData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAssetSelect = (e) => {
    const selectedAssetId = e.target.value;
    const selectedAsset = assets.find(asset => asset.asset_id === selectedAssetId);
    setSelectedAssetDetails(selectedAsset);
    setIssueData(prev => ({
      ...prev,
      asset_id: selectedAssetId,
      quantity: 1
    }));
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const maxQuantity = selectedAssetDetails?.quantity || 0;
    const validValue = Math.min(Math.max(1, value), maxQuantity);
    
    setIssueData(prev => ({
      ...prev,
      quantity: validValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!issueData.asset_id || !issueData.issue_type || !issueData.priority || !issueData.description) {
        throw new Error('Please fill in all required fields');
      }

      if (!issueData.quantity || issueData.quantity < 1 || 
          (selectedAssetDetails && issueData.quantity > selectedAssetDetails.quantity)) {
        throw new Error('Invalid quantity selected');
      }

      const selectedAsset = assets.find(asset => asset.asset_id === issueData.asset_id);
      if (!selectedAsset) {
        throw new Error('Selected asset not found');
      }

      const submissionData = {
        ...issueData,
        asset_id: selectedAsset.asset_id,
        issue_quantity: parseInt(issueData.quantity),
        reported_by: user?.name || 'Unknown User',
        user_picture: user?.picture || '',
        status: 'Pending',
        date_reported: new Date().toISOString(),
        assetName: selectedAsset.assetName,
        assetDetails: selectedAsset.assetDetails
      };
      
      console.log('Submitting issue with data:', submissionData);
      await onAddIssue(submissionData);
      
      setIssueData({
        asset_id: '',
        issue_type: '',
        description: '',
        priority: '',
        quantity: 1,
        reported_by: user?.name || '',
        user_picture: user?.picture || ''
      });
      setSelectedAssetDetails(null);
      onClose();
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert(error.message || 'Error submitting issue. Please try again.');
    }
  };

  const renderAssetSelect = () => (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {issueData.asset_id ? (
          <div className="flex justify-between items-center">
            <span>{assets.find(a => a.asset_id === issueData.asset_id)?.assetName}</span>
            {assets.find(a => a.asset_id === issueData.asset_id)?.productCode && 
             assets.find(a => a.asset_id === issueData.asset_id)?.productCode !== 'N/A' && (
              <span className="text-sm text-gray-600">
                Code: {assets.find(a => a.asset_id === issueData.asset_id)?.productCode}
              </span>
            )}
          </div>
        ) : (
          'Select Asset'
        )}
      </div>
      
      {isDropdownOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          <input
            type="text"
            className="w-full p-2 border-b"
            placeholder="Search by name or product code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          
          {filteredAssets.map(asset => (
            <div
              key={asset.asset_id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                handleAssetSelect({ target: { value: asset.asset_id } });
                setIsDropdownOpen(false);
                setSearchTerm('');
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{asset.assetName}</span>
                {asset.productCode && asset.productCode !== 'N/A' && (
                  <span className="text-sm text-gray-600">Code: {asset.productCode}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-6">Submit Issue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Asset
              </label>
              {renderAssetSelect()}
              {selectedAssetDetails && (
                <p className="text-sm text-gray-600 mt-1">
                  Available Quantity: {selectedAssetDetails.quantity || 0}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quantity for Repair
              </label>
              <input
                type="number"
                name="quantity"
                value={issueData.quantity}
                onChange={handleQuantityChange}
                min="1"
                max={selectedAssetDetails?.quantity || 1}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-600">
                Available: {selectedAssetDetails?.quantity || 0}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Issue Type
              </label>
              <select
                name="issue_type"
                value={issueData.issue_type}
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
                value={issueData.priority}
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
                Description
              </label>
              <textarea
                name="description"
                value={issueData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                required
                placeholder="Describe the issue in detail..."
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!issueData.quantity || issueData.quantity > (selectedAssetDetails?.quantity || 0)}
              >
                Submit Issue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IssueModal;
