import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import PaginationControls from '../assetlists/PaginationControls';
import { faHistory } from "@fortawesome/free-solid-svg-icons";

const formatDate = (date) => {
  return date ? moment(date).format("MM/DD/YYYY") : 'Not yet returned';
};

const BorrowLogs = ({ assetId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const calculateStartIndex = () => {
    return (currentPage - 1) * itemsPerPage + 1;
  };

  const calculateEndIndex = () => {
    const endIndex = currentPage * itemsPerPage;
    return endIndex > logs.length ? logs.length : endIndex;
  };

  const totalPages = Math.ceil(logs.length / itemsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            currentPage === i
              ? 'bg-[#FEC00F] text-black focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
              : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  const paginatedLogs = logs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-3/4 max-h-[90vh] overflow-y-auto relative">
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
              <thead className="bg-black">
                <tr>
                  <th className="px-4 py-2 text-center text-[#FEC00F]">Borrowed Date</th>
                  <th className="px-4 py-2 text-center text-[#FEC00F]">Borrower</th>
                  <th className="px-4 py-2 text-center text-[#FEC00F]">Email</th>
                  <th className="px-4 py-2 text-center text-[#FEC00F]">Department</th>
                  <th className="px-4 py-2 text-center text-[#FEC00F]">Quantity</th>
                  <th className="px-4 py-2 text-center text-[#FEC00F]">Returned Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-center">{formatDate(log.date_borrowed)}</td>
                    <td className="px-4 py-2 text-center">{log.borrower_name}</td>
                    <td className="px-4 py-2 text-center">{log.borrower_email}</td>
                    <td className="px-4 py-2 text-center">{log.borrower_department}</td>
                    <td className="px-4 py-2 text-center">{log.quantity_borrowed}</td>
                    <td className="px-4 py-2 text-center">
                      {formatDate(log.date_returned)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {logs.length === 0 && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <FontAwesomeIcon icon={faHistory} className="text-4xl mb-3" />
              <p className="text-lg font-semibold">No Borrow Logs Found</p>
              <p className="text-sm text-center mt-2">
                There are no recorded borrowing activities for this asset yet.
              </p>
            </div>
          )}
          {logs.length > 0 && (
            <PaginationControls
              itemsPerPage={itemsPerPage}
              handleItemsPerPageChange={handleItemsPerPageChange}
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
              calculateStartIndex={calculateStartIndex}
              calculateEndIndex={calculateEndIndex}
              totalItems={logs.length}
              renderPageNumbers={renderPageNumbers}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowLogs;
