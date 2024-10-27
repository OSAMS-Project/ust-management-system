import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const BorrowLogs = ({ assetId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBorrowLogs = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/borrow-logs/${assetId}`);
        console.log('Fetched borrow logs:', response.data);
        setLogs(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching borrow logs:", error.response ? error.response.data : error.message);
        setError("Failed to fetch borrow logs. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchBorrowLogs();
  }, [assetId]);

  const formatDateTime = (date) => {
    return moment(date).format('MMMM D, YYYY - h:mm A');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Borrow Logs</h2>
          {isLoading ? (
            <p>Loading borrow logs...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Borrowed Date</th>
                  <th className="px-4 py-2 text-left">Borrower</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Returned Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{formatDateTime(log.date_borrowed)}</td>
                    <td className="px-4 py-2">{log.borrower_name}</td>
                    <td className="px-4 py-2">{log.borrower_email}</td>
                    <td className="px-4 py-2">{log.borrower_department}</td>
                    <td className="px-4 py-2">{log.quantity_borrowed}</td>
                    <td className="px-4 py-2">
                      {log.date_returned ? formatDateTime(log.date_returned) : 'Not yet returned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowLogs;
