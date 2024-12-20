import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import PaginationControls from '../assetlists/PaginationControls';
import { faHistory, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const MaintenanceLogs = ({ assetId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchMaintenanceLogs();
  }, [assetId]);

  const fetchMaintenanceLogs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/maintenance/history/${assetId}`);
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching maintenance logs:', error);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCost = (cost) => {
    if (!cost) return 'N/A';
    return `₱${parseFloat(cost).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const getStatusBadge = (log) => {
    if (log.completion_date) {
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
          Completed
        </span>
      );
    }
    return (
      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
        Pending
      </span>
    );
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          Loading maintenance logs...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-4/5 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Maintenance History</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-black">
              <tr>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Date Scheduled</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Type</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Description</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Priority</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Quantity</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Cost</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Technician</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Scheduled By</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Status</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Completion Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">
                    {moment(log.scheduled_date).format('MM/DD/YYYY')}
                  </td>
                  <td className="px-4 py-2 text-center">{log.maintenance_type}</td>
                  <td className="px-4 py-2 text-center">{log.description}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(log.priority)}`}>
                      {log.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{log.maintenance_quantity || 1}</td>
                  <td className="px-4 py-2 text-center">{formatCost(log.maintenance_cost)}</td>
                  <td className="px-4 py-2 text-center">{log.performed_by || 'N/A'}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center">
                      {log.user_picture && (
                        <img 
                          src={log.user_picture} 
                          alt={log.scheduled_by} 
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      )}
                      {log.scheduled_by}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {getStatusBadge(log)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {log.completion_date 
                      ? moment(log.completion_date).format('MM/DD/YYYY')
                      : 'Not Completed'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <FontAwesomeIcon icon={faHistory} className="text-4xl mb-3" />
              <p className="text-lg font-semibold">No Maintenance Logs Found</p>
              <p className="text-sm text-center mt-2">
                There are no recorded maintenance activities for this asset yet.
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

export default MaintenanceLogs; 