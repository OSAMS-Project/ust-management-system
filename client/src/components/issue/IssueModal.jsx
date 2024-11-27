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
                Product Code: {assets.find(a => a.asset_id === issueData.asset_id)?.productCode}
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
                  <span className="text-sm text-gray-600">Product Code: {asset.productCode}</span>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all animate-fadeIn font-roboto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Submit Issue</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
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
              <label className="block text-sm font-semibold text-gray-700">
                Quantity for Repair
              </label>
              <input
                type="number"
                name="quantity"
                value={issueData.quantity}
                onChange={handleQuantityChange}
                min="1"
                max={selectedAssetDetails?.quantity || 1}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Issue Type
              </label>
              <select
                name="issue_type"
                value={issueData.issue_type}
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
                value={issueData.priority}
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
                Description
              </label>
              <textarea
                name="description"
                value={issueData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[120px]"
                required
                placeholder="Describe the issue in detail..."
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
