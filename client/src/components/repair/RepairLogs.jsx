// client/src/components/repair/RepairLogs.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const RepairLogs = ({ assetId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepairLogs();
  }, [assetId]);

  const fetchRepairLogs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/repair/asset/${assetId}`);
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching repair logs:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'fixed': 
        return 'bg-green-100 text-green-800';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
      case 'in repair': 
        return 'bg-blue-100 text-blue-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayStatus = (status, fixedDate) => {
    if (status.toLowerCase() === 'completed' || fixedDate) {
      return 'Fixed';
    }
    return status;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Repair Logs</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Cost</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Fixed Date</th>
                <th className="px-4 py-2 text-left">Performed By</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="px-4 py-2">{moment(log.date).format('MM/DD/YYYY')}</td>
                  <td className="px-4 py-2">{log.repair_type}</td>
                  <td className="px-4 py-2">{log.description}</td>
                  <td className="px-4 py-2">₱{typeof log.cost === 'number' ? log.cost.toFixed(2) : log.cost}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                      {getDisplayStatus(log.status, log.fixed_date)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {log.fixed_date ? moment(log.fixed_date).format('MM/DD/YYYY') : 'N/A'}
                  </td>
                  <td className="px-4 py-2">{log.performed_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No repair logs found for this asset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepairLogs;
