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
    serialNumber: "Serial Number",
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
        setLogs(prevLogs => {
          // Check if log already exists to prevent duplicates
          const logExists = prevLogs.some(existingLog => existingLog.id === newLog.id);
          if (!logExists) {
            return [newLog, ...prevLogs]; // Add new log at the beginning
          }
          return prevLogs; // Return unchanged if log already exists
        });
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
        <p className="text-sm text-gray-600 mb-1">
          <strong className="text-black">Event Allocation</strong>: 
          Allocated <strong className="text-blue-600">{formatValue(log.old_value)}</strong> units 
          to event "<strong className="text-green-600">{formatValue(log.new_value)}</strong>"
        </p>
      );
    }

    if (log.action === 'event_return') {
      const match = log.context?.match(/Event Return: (\d+) unit\(s\) returned from event "([^"]+)"/);
      if (match) {
        const [, quantity, eventName] = match;
        return (
          <p className="text-sm text-gray-600 mb-1">
            <strong className="text-black">Event Return</strong>: 
            Returned <strong className="text-blue-600">{quantity}</strong> units 
            from event "<strong className="text-green-600">{eventName}</strong>"
          </p>
        );
      }
      return (
        <p className="text-sm text-gray-600 mb-1">
          <strong className="text-black">Event Return</strong>: {log.context}
        </p>
      );
    }

    // Skip showing lastUpdated in the log message since it's already in the header
    if (log.field_name === 'lastUpdated') {
      return null;
    }

    // Default side-by-side layout for all fields including assetDetails
    return (
      <div className="text-sm text-gray-600 mb-1">
        <p>
          <strong className="text-black">{fieldNameMapping[log.field_name] || log.field_name}</strong>: 
          "<strong className="text-blue-600">{formatValue(log.old_value)}</strong>" → 
          "<strong className="text-green-600">{formatValue(log.new_value)}</strong>"
        </p>
      </div>
    );
  };

  // Remove duplicates and group logs by timestamp and user
  const uniqueLogs = logs.filter((log, index, self) => 
    index === self.findIndex(l => l.id === log.id)
  );

  // Group logs by timestamp and user (same edit session)
  const groupedLogs = uniqueLogs.reduce((acc, log) => {
    const timestamp = moment(log.lastUpdated || log.created_at).format('MM-DD-YYYY HH:mm:ss');
    const groupKey = `${timestamp}-${log.modified_by}`;
    
    if (!acc[groupKey]) {
      acc[groupKey] = {
        timestamp: moment(log.lastUpdated || log.created_at).format('MM-DD-YYYY'),
        modified_by: log.modified_by,
        user_picture: log.user_picture,
        logs: []
      };
    }
    acc[groupKey].logs.push(log);
    return acc;
  }, {});

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
        ) : Object.keys(groupedLogs).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <FontAwesomeIcon icon={faHistory} className="text-4xl mb-3" />
            <p className="text-lg font-semibold">No Activity Logs Found</p>
            <p className="text-sm text-center mt-2">
              There are no recorded activities for this asset yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedLogs)
              .sort(([a], [b]) => b.localeCompare(a)) // Sort by timestamp descending
              .map(([groupKey, group]) => {
                // Filter out logs that return null from formatLogMessage
                const validLogs = group.logs.filter(log => formatLogMessage(log) !== null);
                
                if (validLogs.length === 0) return null;
                
                return (
                  <div key={groupKey} className="bg-gray-100 p-3 rounded-lg">
                    <p className="font-semibold text-sm text-gray-700 mb-2">
                      Last Updated on {group.timestamp}
                    </p>
                    <div className="flex items-center mb-3 text-xs text-gray-500">
                      {group.user_picture && (
                        <img 
                          src={group.user_picture} 
                          alt="User"
                          className="w-4 h-4 rounded-full mr-1"
                        />
                      )}
                      <span>Modified by {group.modified_by || 'Unknown User'}</span>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-3">
                      {validLogs.map((log) => (
                        <div key={log.id}>
                          {formatLogMessage(log)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetActivityLogs;