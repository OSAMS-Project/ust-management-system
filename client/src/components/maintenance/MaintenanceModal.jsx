import React, { useState, useEffect } from 'react';

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

  const availableAssets = assets.filter(asset => {
    const hasPendingMaintenance = maintenances.some(maintenance => 
      maintenance.asset_id === asset.asset_id && 
      !maintenance.completion_date
    );
    return !hasPendingMaintenance;
  });

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Schedule Maintenance</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Asset Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Asset *
              </label>
              <select
                name="asset_id"
                value={maintenanceData.asset_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Asset</option>
                {availableAssets.map(asset => (
                  <option key={asset.asset_id} value={asset.asset_id}>
                    {asset.assetName}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quantity * (Available: {selectedAsset?.quantity || 0})
              </label>
              <input
                type="number"
                name="quantity"
                value={maintenanceData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                min="1"
                max={selectedAsset?.quantity || 1}
                required
              />
            </div>

            {/* Maintenance Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Maintenance Type *
              </label>
              <select
                name="maintenance_type"
                value={maintenanceData.maintenance_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                {maintenanceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Priority Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Priority Level *
              </label>
              <select
                name="priority"
                value={maintenanceData.priority}
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

            {/* Scheduled Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Scheduled Date *
              </label>
              <input
                type="date"
                name="scheduled_date"
                value={maintenanceData.scheduled_date.split('T')[0]}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Assigned Technician */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Assigned Technician
              </label>
              <input
                type="text"
                name="performed_by"
                value={maintenanceData.performed_by}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter technician name"
              />
            </div>

            {/* Estimated Cost */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Estimated Cost
              </label>
              <input
                type="number"
                name="maintenance_cost"
                value={maintenanceData.maintenance_cost}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter estimated cost"
                min="0"
                step="0.01"
              />
            </div>

            {/* Description/Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description/Notes
              </label>
              <textarea
                name="description"
                value={maintenanceData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter maintenance details..."
                rows="3"
              />
            </div>

            {/* Action Buttons */}
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
                Schedule Maintenance
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal; 