import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faHistory } from "@fortawesome/free-solid-svg-icons";

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
    category: "Category",
    location: "Location",
    type: "Type",
    assetDetails: "Details",
    event_allocation: "Event Allocation"
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/asset-activity-logs/${assetId}`);
        setLogs(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
        setError("Failed to fetch activity logs. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchLogs();

    // Set up SSE connection
    const eventSource = new EventSource(`${process.env.REACT_APP_API_URL}/api/assets/sse`);

    eventSource.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      if (newLog.asset_id === assetId) {
        setLogs(prevLogs => [...prevLogs, newLog]);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    // Clean up SSE connection on unmount
    return () => {
      eventSource.close();
    };
  }, [assetId]);

  const groupedLogs = logs.reduce((acc, log) => {
    const timestamp = moment(log.lastUpdated || log.created_at).format('MM-DD-YYYY');
    if (!acc[timestamp]) {
      acc[timestamp] = [];
    }
    acc[timestamp].push(log);
    return acc;
  }, {});

  const formatLogMessage = (log) => {
    const formatValue = (value) => {
      // Check if the value is a date string in ISO format
      if (value && value.includes('T') && value.includes('Z')) {
        return moment(value).format('MM-DD-YYYY');
      }
      return value || '(empty)';
    };

    if (log.action === 'event_allocation') {
      return (
        <p key={log.id} className="text-sm text-gray-600 mb-1">
          <strong className="text-black">Event Allocation</strong>: 
          Allocated <strong className="text-blue-600">{formatValue(log.old_value)}</strong> units 
          to event "<strong className="text-green-600">{formatValue(log.new_value)}</strong>"
        </p>
      );
    }

    if (log.action === 'event_return') {
      return (
        <p key={log.id} className="text-sm text-gray-600 mb-1">
          <strong className="text-green-600">{formatValue(log.context)}</strong>
        </p>
      );
    }

    // Skip showing lastUpdated in the log message since it's already in the header
    if (log.field_name === 'lastUpdated') {
      return null;
    }

    return (
      <div key={log.id} className="text-sm text-gray-600 mb-1">
        <p>
          <strong className="text-black">{fieldNameMapping[log.field_name] || log.field_name}</strong>: 
          "<strong className="text-blue-600">{formatValue(log.old_value)}</strong>" → 
          "<strong className="text-green-600">{formatValue(log.new_value)}</strong>"
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Asset Activity Logs</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : logs.length === 0 || (logs.length === 1 && logs[0].action === 'No Activity') ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <FontAwesomeIcon icon={faHistory} className="text-4xl mb-3" />
            <p className="text-lg font-semibold">No Activity Logs Found</p>
            <p className="text-sm text-center mt-2">
              There are no recorded activities for this asset yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedLogs).map(([timestamp, logGroup]) => (
              <div key={timestamp} className="bg-gray-100 p-3 rounded-lg">
                <p className="font-semibold text-sm text-gray-700 mb-2">
                  Last Updated on {timestamp}
                </p>
                <div className="flex items-center mb-3 text-xs text-gray-500">
                  {logGroup[0].user_picture && (
                    <img 
                      src={logGroup[0].user_picture} 
                      alt="User"
                      className="w-4 h-4 rounded-full mr-1"
                    />
                  )}
                  <span>Modified by {logGroup[0].modified_by || 'Unknown User'}</span>
                </div>
                {logGroup.map((log) => formatLogMessage(log))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetActivityLogs;