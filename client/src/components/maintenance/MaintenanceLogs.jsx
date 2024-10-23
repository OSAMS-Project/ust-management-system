// client/src/components/maintenance/MaintenanceLogs.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const MaintenanceLogs = ({ assetId, onClose }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Maintenance/asset/${assetId}`);
        console.log('Fetched maintenance logs:', response.data);
        const completedLogs = response.data.filter(log => log.status === 'Completed');
        console.log('Filtered completed logs:', completedLogs);
        setLogs(completedLogs);
      } catch (error) {
        console.error('Error fetching maintenance logs:', error);
      }
    };
    fetchLogs();
  }, [assetId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Maintenance Logs</h2>
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Cost</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Fixed Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="px-4 py-2">{moment(log.date).format('MM/DD/YYYY')}</td>
                  <td className="px-4 py-2">{log.maintenance_type}</td>
                  <td className="px-4 py-2">{log.description}</td>
                  <td className="px-4 py-2">₱{typeof log.cost === 'number' ? log.cost.toFixed(2) : log.cost}</td>
                  <td className="px-4 py-2">{log.status}</td>
                  <td className="px-4 py-2">{log.fixed_date ? moment(log.fixed_date).format('MM/DD/YYYY') : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={onClose}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceLogs;
