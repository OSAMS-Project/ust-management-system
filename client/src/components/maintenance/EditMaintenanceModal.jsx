import React, { useState } from 'react';

const EditMaintenanceModal = ({ isOpen, onClose, onEditMaintenance, maintenance, assets }) => {
  const [editData, setEditData] = useState({
    maintenance_type: maintenance.maintenance_type || '',
    description: maintenance.description || '',
    scheduled_date: maintenance.scheduled_date || '',
    completion_date: maintenance.completion_date || '',
    status: maintenance.status || 'Scheduled',
    priority: maintenance.priority || '',
    maintenance_cost: maintenance.maintenance_cost || '',
    technician_notes: maintenance.technician_notes || '',
    performed_by: maintenance.performed_by || '',
    quantity: maintenance.quantity || 1
  });

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

  const statusOptions = [
    'Scheduled',
    'In Progress',
    'Completed',
    'Cancelled',
    'Overdue'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEditMaintenance(maintenance.id, editData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Maintenance Record</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Asset Display (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Asset
              </label>
              <input
                type="text"
                value={assets.find(a => a.asset_id === maintenance.asset_id)?.assetName || ''}
                className="w-full px-3 py-2 border rounded-md bg-gray-100"
                disabled
              />
            </div>

            {/* Maintenance Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Maintenance Type *
              </label>
              <select
                name="maintenance_type"
                value={editData.maintenance_type}
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

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Status *
              </label>
              <select
                name="status"
                value={editData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
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

            {/* Scheduled Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Scheduled Date *
              </label>
              <input
                type="datetime-local"
                name="scheduled_date"
                value={editData.scheduled_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Completion Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Completion Date
              </label>
              <input
                type="datetime-local"
                name="completion_date"
                value={editData.completion_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Technician */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Technician
              </label>
              <input
                type="text"
                name="performed_by"
                value={editData.performed_by}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter technician name"
              />
            </div>

            {/* Cost */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Maintenance Cost
              </label>
              <input
                type="number"
                name="maintenance_cost"
                value={editData.maintenance_cost}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Technician Notes
              </label>
              <textarea
                name="technician_notes"
                value={editData.technician_notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={editData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                min="1"
                required
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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMaintenanceModal; 