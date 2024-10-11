import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const AssetActivityLogs = ({ assetId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/asset-activity-logs/${assetId}`);
        setLogs(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching activity logs:", error.response ? error.response.data : error.message);
        setError("Failed to fetch activity logs. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [assetId]);

  const groupedLogs = logs.reduce((acc, log) => {
    const timestamp = moment(log.timestamp).format('MMMM D, YYYY h:mm A');
    if (!acc[timestamp]) {
      acc[timestamp] = [];
    }
    acc[timestamp].push(log);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Asset Activity Logs</h2>
          {isLoading ? (
            <p>Loading activity logs...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : logs.length === 0 ? (
            <p>No activity logs found for this asset.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedLogs).map(([timestamp, logGroup]) => (
                <div key={timestamp} className="border-b pb-4 mb-4">
                  <p className="font-semibold mb-2">Update on {timestamp}</p>
                  {logGroup.map((log, index) => (
                    <p key={index} className="ml-4 text-gray-700">
                      {log.field_name}, Old Value: {log.old_value || '(empty)'}, New Value: {log.new_value}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}
          <button
            onClick={onClose}
            className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetActivityLogs;
