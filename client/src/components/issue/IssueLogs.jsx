import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const IssueLogs = ({ assetId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssueLogs();
  }, [assetId]);

  const fetchIssueLogs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/asset-issues/logs/${assetId}`);
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching issue logs:', error);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in repair': return 'bg-blue-100 text-blue-800';
      case 'in progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Issue Logs</h2>
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
                <th className="px-4 py-2 text-left">Date Reported</th>
                <th className="px-4 py-2 text-left">Issue Type</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Priority</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Reported By</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="px-4 py-2">
                    {moment(log.created_at).format('MM/DD/YYYY')}
                  </td>
                  <td className="px-4 py-2">{log.issue_type}</td>
                  <td className="px-4 py-2">{log.description}</td>
                  <td className="px-4 py-2">{log.quantity || 1}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(log.priority)}`}>
                      {log.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <img 
                        src={log.user_picture || "https://via.placeholder.com/30"} 
                        alt={log.reported_by} 
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      {log.reported_by}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No issue logs found for this asset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueLogs; 