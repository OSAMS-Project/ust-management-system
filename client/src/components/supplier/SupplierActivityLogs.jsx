import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faTimes } from '@fortawesome/free-solid-svg-icons';

const SupplierActivityLogs = ({ supplierId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fieldNameMapping = {
    name: "Supplier Name",
    product: "Product",
    streetaddress: "Street Address",
    city: "City",
    contactno: "Contact Number",
    email: "Email",
    lastUpdated: "Last Updated",
    created_at: "Date Added"
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/supplier-activity-logs/${supplierId}`);
        setLogs(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setError("Failed to fetch activity logs. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [supplierId]);

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Supplier Activity Logs</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
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
              There are no recorded activities for this supplier yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedLogs).map(([timestamp, logGroup]) => (
              <div key={timestamp} className="bg-gray-100 p-3 rounded-lg">
                <p className="font-semibold text-sm text-gray-700 mb-2">
                  Update on {timestamp}
                </p>
                {logGroup.map((log, index) => (
                  <p key={index} className="text-sm text-gray-600 mb-1">
                    <strong className="text-black">
                      {fieldNameMapping[log.field_name] || log.field_name}
                    </strong>
                    : "
                    <strong className="text-blue-600">
                      {log.old_value || '(empty)'}
                    </strong>
                    " → "
                    <strong className="text-green-600">
                      {log.new_value}
                    </strong>
                    "
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierActivityLogs;
