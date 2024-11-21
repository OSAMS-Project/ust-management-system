// client/src/components/repair/RepairLogs.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import PaginationControls from '../assetlists/PaginationControls';
import { faHistory, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const RepairLogs = ({ assetId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchRepairLogs();
  }, [assetId]);

  const fetchRepairLogs = async () => {
    try {
      console.log('Fetching logs for asset:', assetId);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/repair/asset/${assetId}`);
      console.log('Repair logs response:', response.data);
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
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayStatus = (status, completionDate) => {
    if (status.toLowerCase() === 'completed' && completionDate) {
      return 'Completed';
    }
    return status;
  };

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
              ? 'bg-black text-[#FEC00F] focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
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

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            <thead className="bg-black">
              <tr>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Date</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Type</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Description</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Quantity</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Cost</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Status</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Completion Date</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Performed By</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">{moment(log.date).format('MM/DD/YYYY')}</td>
                  <td className="px-4 py-2 text-center">{log.repair_type}</td>
                  <td className="px-4 py-2 text-center">{log.description}</td>
                  <td className="px-4 py-2 text-center">
                    <span className="font-medium">{log.repair_quantity || 1}</span>
                  </td>
                  <td className="px-4 py-2 text-center">₱{typeof log.cost === 'number' ? log.cost.toFixed(2) : log.cost}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                      {getDisplayStatus(log.status, log.completion_date)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {log.completion_date ? moment(log.completion_date).format('MM/DD/YYYY') : 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-center">{log.performed_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <FontAwesomeIcon icon={faHistory} className="text-4xl mb-3" />
              <p className="text-lg font-semibold">No Repair Logs Found</p>
              <p className="text-sm text-center mt-2">
                There are no recorded repair activities for this asset yet.
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

export default RepairLogs;
