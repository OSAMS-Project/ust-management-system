import React, { useState, useEffect } from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';

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

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-black">Edit Maintenance Record</h3>
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

          {/* Form Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Read-only Asset Information */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Asset
                </label>
                <div className="w-full px-4 py-2 rounded-lg bg-gray-100">
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
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity * (Available: {selectedAsset?.quantity || 0})
                </label>
                <input
                  type="number"
                  name="maintenance_quantity"
                  value={formData.maintenance_quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="1"
                  max={selectedAsset?.quantity + parseInt(maintenance.maintenance_quantity)}
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
                  value={formData.maintenance_type}
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
                  value={formData.priority}
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
                  value={formData.scheduled_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Technician */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Technician
                </label>
                <input
                  type="text"
                  name="performed_by"
                  value={formData.performed_by}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter technician name"
                />
              </div>

              {/* Cost */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cost
                </label>
                <input
                  type="number"
                  name="maintenance_cost"
                  value={formData.maintenance_cost}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter cost"
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
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows="3"
                  placeholder="Enter description or notes..."
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default EditMaintenanceModal; 