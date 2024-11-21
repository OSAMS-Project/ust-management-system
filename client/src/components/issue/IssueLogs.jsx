import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import PaginationControls from '../assetlists/PaginationControls';

const IssueLogs = ({ assetId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchIssueLogs();
  }, [assetId]);

  const fetchIssueLogs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/asset-issues/logs/${assetId}`);
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching issue logs:', error);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in repair': return 'bg-blue-100 text-blue-800';
      case 'in progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Issue Logs</h2>
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
                <th className="px-4 py-2 text-center text-[#FEC00F]">Date Reported</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Issue Type</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Description</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Quantity</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Priority</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Status</th>
                <th className="px-4 py-2 text-center text-[#FEC00F]">Reported By</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">
                    {moment(log.created_at).format('MM/DD/YYYY')}
                  </td>
                  <td className="px-4 py-2 text-center">{log.issue_type}</td>
                  <td className="px-4 py-2 text-center">{log.description}</td>
                  <td className="px-4 py-2 text-center">{log.issue_quantity || 1}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(log.priority)}`}>
                      {log.priority}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center">
                      <img 
                        src={log.user_picture || "https://via.placeholder.com/30"} 
                        alt={log.reported_by} 
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      {log.reported_by}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No issue logs found for this asset.
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

export default IssueLogs; 