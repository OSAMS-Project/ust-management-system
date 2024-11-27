import React, { useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import EditMaintenanceModal from './EditMaintenanceModal';
import DeleteConfirmationModal from '../utils/DeleteConfirmationModal';

const MaintenanceTable = ({ maintenances, setMaintenances, assets, loading, onRemoveMaintenance, onViewHistory, setNotification }) => {
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);

  if (loading) {
    return <div className="flex justify-center items-center h-32">Loading...</div>;
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCost = (cost) => {
    if (!cost) return 'N/A';
    return `₱${parseFloat(cost).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handleMarkAsComplete = async (maintenance) => {
    if (!maintenance || !maintenance.id) {
      console.error('Invalid maintenance record');
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/maintenance/mark-complete/${maintenance.id}`
      );
      
      if (response.data) {
        setMaintenances(prevMaintenances => 
          prevMaintenances.map(m => 
            m.id === maintenance.id 
              ? { ...m, completion_date: new Date().toISOString(), status: 'Completed' }
              : m
          )
        );

        setNotification({
          type: 'success',
          message: 'Maintenance marked as complete successfully'
        });
      }
    } catch (error) {
      console.error('Error marking maintenance as complete:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.error || 'Failed to mark maintenance as complete'
      });
    }
  };

  const handleRemoveMaintenance = async (maintenance) => {
    try {
      // Ensure we're using the correct maintenance quantity
      const maintenanceQuantity = parseInt(maintenance.maintenance_quantity || maintenance.quantity);
      
      // First restore the quantity
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/maintenance/restore-quantity/${maintenance.id}`,
        {
          asset_id: maintenance.asset_id,
          maintenance_quantity: maintenanceQuantity
        }
      );

      if (response.data) {
        // Then delete the maintenance record
        await onRemoveMaintenance(maintenance.id);
        
        // Update local state
        setMaintenances(prevMaintenances => 
          prevMaintenances.filter(m => m.id !== maintenance.id)
        );

        setNotification({
          type: 'success',
          message: 'Maintenance record deleted and quantity restored successfully'
        });
      }
    } catch (error) {
      console.error('Error removing maintenance:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.error || 'Failed to remove maintenance record'
      });
    }
  };

  const handleEditClick = (maintenance) => {
    setEditingMaintenance(maintenance);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditingMaintenance(null);
    setIsEditModalOpen(false);
  };

  const handleEditSave = async (updatedData) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/maintenance/${editingMaintenance.id}`,
        updatedData
      );
      
      if (response.data) {
        setMaintenances(prevMaintenances => 
          prevMaintenances.map(m => 
            m.id === editingMaintenance.id ? { ...m, ...updatedData } : m
          )
        );

        setNotification({
          type: 'success',
          message: 'Maintenance record updated successfully'
        });
        handleEditClose();
      }
    } catch (error) {
      console.error('Error updating maintenance:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.error || 'Failed to update maintenance record'
      });
    }
  };

  const handleDeleteClick = (maintenance) => {
    setMaintenanceToDelete(maintenance);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (maintenanceToDelete) {
      await handleRemoveMaintenance(maintenanceToDelete);
      setDeleteModalOpen(false);
      setMaintenanceToDelete(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-black">
          <tr>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Asset</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Type</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Priority</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Quantity</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Scheduled Date</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Technician</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Cost</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Scheduled By</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {maintenances
            .filter(maintenance => !maintenance.completion_date)
            .map((maintenance) => {
              const asset = assets.find(a => a.asset_id === maintenance.asset_id);
              const assetName = asset ? asset.assetName : 'Unknown Asset';
              const productCode = asset?.productCode && asset.productCode !== 'N/A' ? asset.productCode : null;
              
              return (
                <tr key={maintenance.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{assetName}</span>
                      {productCode && (
                        <span className="text-sm text-gray-600">
                          Product Code: {productCode}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">{maintenance.maintenance_type}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(maintenance.priority)}`}>
                      {maintenance.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{maintenance.maintenance_quantity}</td>
                  <td className="px-4 py-2 text-center">
                    {moment(maintenance.scheduled_date).format('MM/DD/YYYY')}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {maintenance.performed_by || 'Not Assigned'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {formatCost(maintenance.maintenance_cost)}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center">
                      {maintenance.user_picture && (
                        <img 
                          src={maintenance.user_picture} 
                          alt={maintenance.scheduled_by} 
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      )}
                      {maintenance.scheduled_by}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditClick(maintenance)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleMarkAsComplete(maintenance)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                      >
                        Complete
                      </button>
                      {onViewHistory && (
                        <button
                          onClick={() => onViewHistory(maintenance.asset_id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                        >
                          History
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(maintenance)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      {maintenances.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No active maintenance found
        </div>
      )}
      
      {isEditModalOpen && (
        <EditMaintenanceModal
          maintenance={editingMaintenance}
          onClose={handleEditClose}
          onSave={handleEditSave}
          assets={assets}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMaintenanceToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete this maintenance record${maintenanceToDelete ? ` for ${assets.find(a => a.asset_id === maintenanceToDelete.asset_id)?.assetName || 'Unknown Asset'}` : ''}? This action cannot be undone.`}
      />
    </div>
  );
};

export default MaintenanceTable;