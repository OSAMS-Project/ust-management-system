import React, { useState } from 'react';
import moment from 'moment';

const AssetRequestTable = ({ assetRequests, onApprove, onDecline, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = assetRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(assetRequests.length / itemsPerPage);

  // Add page navigation handlers
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Add these handler functions
  const handleButtonClick = (e, action, id) => {
    e.stopPropagation();  // This prevents the click from bubbling up to the row
    action(id);
  };

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
      <table className="min-w-full bg-white border-collapse">
        <thead className="bg-black text-[#FEC00F]">
          <tr>
            <th className="py-2 px-4 border-b text-center">Asset Name</th>
            <th className="py-2 px-4 border-b text-center">Quantity</th>
            <th className="py-2 px-4 border-b text-center">Date Requested</th>
            <th className="py-2 px-4 border-b text-center">Requested By</th>
            <th className="py-2 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((request) => (
            <tr 
              key={request.id}
              onClick={() => onRowClick(request)}
              className="hover:bg-gray-100 cursor-pointer"
            >
              <td className="py-2 px-4 border-b text-center">{request.asset_name}</td>
              <td className="py-2 px-4 border-b text-center">{request.quantity}</td>
              <td className="py-2 px-4 border-b text-center">
                {moment(request.created_at).format('MM/DD/YYYY')}
              </td>
              <td className="py-2 px-4 border-b text-center">
                <div className="flex items-center justify-center">
                  <img
                    src={request.user_picture || "/osa-img.png"}
                    alt={request.created_by}
                    className="w-8 h-8 mr-2 object-contain"
                  />
                  {request.created_by}
                </div>
              </td>
              <td className="px-4 py-2 text-center">
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={(e) => handleButtonClick(e, onApprove, request.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => handleButtonClick(e, onDecline, request.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Decline
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Replace the previous pagination controls with numbered pagination */}
      <div className="mt-4 mb-8 flex justify-center">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`mx-1 px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-yellow-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssetRequestTable;