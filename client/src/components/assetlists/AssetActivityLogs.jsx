import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const AssetActivityLogs = ({ assetId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fieldNameMapping = {
    productCode: "Product Code",
    assetName: "Asset",
    cost: "Cost per Unit",
    quantity: "Available Quantity",
    totalCost: "Total Cost",
    is_active: "Borrow",
    quantity_for_borrowing: "Borrowing Quantity",
    lastUpdated: "Last Updated",
    category: "Category",
    location: "Location",
    type: "Type",
    assetDetails: "Details"
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/asset-activity-logs/${assetId}`);
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
    const timestamp = moment(log.timestamp).format('MMMM D, YYYY - h:mm A');
    if (!acc[timestamp]) {
      acc[timestamp] = [];
    }
    acc[timestamp].push(log);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Asset Activity Logs</h2>
        {isLoading ? (
          <p>Loading activity logs...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedLogs).map(([timestamp, logGroup]) => (
              <div key={timestamp} className="bg-gray-100 p-3 rounded-lg">
                <p className="font-semibold text-sm text-gray-700 mb-2">Update on {timestamp}</p>
                {logGroup.map((log, index) => (
                  <p key={index} className="text-sm text-gray-600 mb-1">
                    <strong className="text-black">{fieldNameMapping[log.field_name] || log.field_name}</strong>: "<strong className="text-blue-600">{log.old_value || '(empty)'}</strong>" → "<strong className="text-green-600">{log.new_value}</strong>"
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AssetActivityLogs;
