import React from 'react';
import moment from 'moment';
import { ClipboardEdit, Trash2, CheckCircle, History } from 'lucide-react';

const MaintenanceTable = ({ maintenances, assets, loading, onEditMaintenance, onRemoveMaintenance, onViewHistory }) => {
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

  const handleMarkAsComplete = (maintenance) => {
    onEditMaintenance(maintenance.id, {
      completion_date: new Date().toISOString()
    });
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
              
              return (
                <tr key={maintenance.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">{assetName}</td>
                  <td className="px-4 py-2 text-center">{maintenance.maintenance_type}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(maintenance.priority)}`}>
                      {maintenance.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{maintenance.maintenance_quantity}</td>
                  <td className="px-4 py-2 text-center">
                    {moment(maintenance.scheduled_date).format('MM/DD/YYYY HH:mm')}
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
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => onEditMaintenance(maintenance)}
                        className="bg-yellow-500 text-white p-1.5 rounded hover:bg-yellow-600"
                        title="Edit"
                      >
                        <ClipboardEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMarkAsComplete(maintenance)}
                        className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600"
                        title="Mark as Complete"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      {onViewHistory && (
                        <button
                          onClick={() => onViewHistory(maintenance.asset_id)}
                          className="bg-blue-500 text-white p-1.5 rounded hover:bg-blue-600"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onRemoveMaintenance(maintenance.id)}
                        className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
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
    </div>
  );
};

export default MaintenanceTable; 