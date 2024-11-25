import React, { useState, useEffect, useRef } from 'react';

const MaintenanceModal = ({ isOpen, onClose, onAddMaintenance, assets, user, maintenances = [] }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState({
    asset_id: '',
    maintenance_type: '',
    description: '',
    scheduled_date: '',
    completion_date: '',
    status: 'Scheduled',
    priority: '',
    maintenance_cost: '',
    technician_notes: '',
    next_maintenance_date: '',
    performed_by: '',
    quantity: 1,
    scheduled_by: user?.name || '',
    user_picture: user?.picture || ''
  });
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

  const availableAssets = assets.filter(asset => {
    const hasPendingMaintenance = maintenances.some(maintenance => 
      maintenance.asset_id === asset.asset_id && 
      !maintenance.completion_date
    );
    return !hasPendingMaintenance;
  });

  const filteredAssets = availableAssets.filter(asset => {
    const searchLower = searchTerm.toLowerCase();
    const assetNameMatch = asset.assetName.toLowerCase().includes(searchLower);
    const productCodeMatch = asset.productCode && 
                           asset.productCode !== 'N/A' && 
                           asset.productCode.toLowerCase().includes(searchLower);
    return assetNameMatch || productCodeMatch;
  });

  const renderAssetSelect = () => (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {maintenanceData.asset_id ? (
          <div className="flex justify-between items-center">
            <span>{assets.find(a => a.asset_id === maintenanceData.asset_id)?.assetName}</span>
            {assets.find(a => a.asset_id === maintenanceData.asset_id)?.productCode && 
             assets.find(a => a.asset_id === maintenanceData.asset_id)?.productCode !== 'N/A' && (
              <span className="text-sm text-gray-600">
                Code: {assets.find(a => a.asset_id === maintenanceData.asset_id)?.productCode}
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
                handleInputChange({ target: { name: 'asset_id', value: asset.asset_id } });
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

  useEffect(() => {
    if (maintenanceData.asset_id) {
      const asset = assets.find(a => a.asset_id === maintenanceData.asset_id);
      setSelectedAsset(asset);
    }
  }, [maintenanceData.asset_id, assets]);

  const maintenanceTypes = [
    'Preventive',
    'Corrective',
    'Predictive',
    'Routine Check',
    'Emergency Repair',
    'Calibration',
    'Inspection'
  ];

  const priorityLevels = [
    'Low',
    'Medium',
    'High',
    'Critical'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedDate = new Date(maintenanceData.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        alert('Scheduled date cannot be in the past');
        return;
      }

      if (!maintenanceData.asset_id || !maintenanceData.maintenance_type || 
          !maintenanceData.scheduled_date || !maintenanceData.priority) {
        throw new Error('Please fill in all required fields');
      }

      const selectedAsset = assets.find(asset => asset.asset_id === maintenanceData.asset_id);
      if (!selectedAsset) {
        throw new Error('Selected asset not found');
      }

      const submissionData = {
        ...maintenanceData,
        status: 'Scheduled',
        assetName: selectedAsset.assetName
      };
      
      await onAddMaintenance(submissionData);
      
      setMaintenanceData({
        asset_id: '',
        maintenance_type: '',
        description: '',
        scheduled_date: '',
        completion_date: '',
        status: 'Scheduled',
        priority: '',
        maintenance_cost: '',
        technician_notes: '',
        next_maintenance_date: '',
        performed_by: '',
        quantity: 1,
        scheduled_by: user?.name || '',
        user_picture: user?.picture || ''
      });
      onClose();
    } catch (error) {
      console.error('Error submitting maintenance:', error);
      alert(error.message || 'Error scheduling maintenance. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Asset Selection */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Asset *
          </label>
          {renderAssetSelect()}
        </div>

        {/* Quantity */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quantity * (Available: {selectedAsset?.quantity || 0})
          </label>
          <input
            type="number"
            name="quantity"
            value={maintenanceData.quantity}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter quantity"
            min="1"
            max={selectedAsset?.quantity || 1}
            required
          />
        </div>

        {/* Maintenance Type */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Maintenance Type *
          </label>
          <select
            name="maintenance_type"
            value={maintenanceData.maintenance_type}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          >
            <option value="">Select Type</option>
            {maintenanceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Priority Level */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Priority Level *
          </label>
          <select
            name="priority"
            value={maintenanceData.priority}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          >
            <option value="">Select Priority</option>
            {priorityLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Scheduled Date */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Scheduled Date *
          </label>
          <input
            type="date"
            name="scheduled_date"
            value={maintenanceData.scheduled_date.split('T')[0]}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Assigned Technician */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Assigned Technician
          </label>
          <input
            type="text"
            name="performed_by"
            value={maintenanceData.performed_by}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter technician name"
          />
        </div>

        {/* Estimated Cost */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Estimated Cost
          </label>
          <input
            type="number"
            name="maintenance_cost"
            value={maintenanceData.maintenance_cost}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter estimated cost"
            min="0"
            step="0.01"
          />
        </div>

        {/* Description/Notes */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description/Notes
          </label>
          <textarea
            name="description"
            value={maintenanceData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Enter maintenance details..."
            rows="3"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
          >
            Schedule Maintenance
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceModal; 