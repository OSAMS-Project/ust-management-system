import React, { useState, useEffect } from 'react';
import moment from 'moment';

const EditMaintenanceModal = ({ maintenance, onClose, onSave, assets }) => {
  const [formData, setFormData] = useState({
    maintenance_type: '',
    description: '',
    scheduled_date: '',
    priority: '',
    performed_by: '',
    maintenance_cost: '',
    technician_notes: '',
    maintenance_quantity: ''
  });

  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    if (maintenance) {
      setFormData({
        maintenance_type: maintenance.maintenance_type || '',
        description: maintenance.description || '',
        scheduled_date: moment(maintenance.scheduled_date).format('YYYY-MM-DD'),
        priority: maintenance.priority || '',
        performed_by: maintenance.performed_by || '',
        maintenance_cost: maintenance.maintenance_cost || '',
        technician_notes: maintenance.technician_notes || '',
        maintenance_quantity: maintenance.maintenance_quantity || 1
      });

      // Find the associated asset
      const asset = assets.find(a => a.asset_id === maintenance.asset_id);
      if (asset) {
        setSelectedAsset(asset);
      }
    }
  }, [maintenance, assets]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert quantity to number for comparison
    const newQuantity = parseInt(formData.maintenance_quantity);
    const oldQuantity = parseInt(maintenance.maintenance_quantity);
    const availableQuantity = selectedAsset?.quantity || 0;

    // Calculate the maximum allowed quantity
    const maxAllowedQuantity = availableQuantity + oldQuantity;

    // Validate the new quantity
    if (newQuantity > maxAllowedQuantity) {
      alert(`Cannot set quantity higher than ${maxAllowedQuantity}`);
      return;
    }

    onSave(formData);
  };

  const maintenanceTypes = [
    'Preventive',
    'Corrective',
    'Predictive',
    'Routine Check',
    'Emergency Repair',
    'Calibration',
    'Inspection'
  ];

  const priorityLevels = ['Low', 'Medium', 'High', 'Critical'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Maintenance Record</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only Asset Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Asset
            </label>
            <div className="mt-1 p-2 bg-gray-100 rounded-md">
              <div className="flex flex-col">
                <span className="font-medium">{selectedAsset?.assetName || 'Unknown Asset'}</span>
                {selectedAsset?.productCode && selectedAsset.productCode !== 'N/A' && (
                  <span className="text-sm text-gray-600">
                    Product Code: {selectedAsset.productCode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity * (Available: {selectedAsset?.quantity || 0})
            </label>
            <input
              type="number"
              name="maintenance_quantity"
              value={formData.maintenance_quantity}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
              max={selectedAsset?.quantity + parseInt(maintenance.maintenance_quantity)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Maintenance Type *
            </label>
            <select
              name="maintenance_type"
              value={formData.maintenance_type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Type</option>
              {maintenanceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priority Level *
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Priority</option>
              {priorityLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Scheduled Date *
            </label>
            <input
              type="date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Technician
            </label>
            <input
              type="text"
              name="performed_by"
              value={formData.performed_by}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter technician name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cost
            </label>
            <input
              type="number"
              name="maintenance_cost"
              value={formData.maintenance_cost}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter cost"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description/Notes
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows="3"
              placeholder="Enter description or notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
  );
};

export default EditMaintenanceModal; 