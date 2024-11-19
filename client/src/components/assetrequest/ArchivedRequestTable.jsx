import React, { useState } from 'react';
import moment from 'moment';
import PaginationControls from '../assetlists/PaginationControls';

const ArchivedRequestTable = ({ archivedRequests, onRestore, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(archivedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = archivedRequests.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page on items per page change
  };

  const calculateStartIndex = () => (currentPage - 1) * itemsPerPage + 1;
  const calculateEndIndex = () => Math.min(calculateStartIndex() + itemsPerPage - 1, archivedRequests.length);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    pageNumbers.push(
      ...Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index
      ).map((i) => (
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            i === currentPage
              ? "z-10 bg-[#FEC00F] text-black font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FEC00F]"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
          }`}
        >
          {i}
        </button>
      ))
    );

    return pageNumbers;
  };

  return (
    <div className="mt-8">
      <table className="min-w-full bg-white border-collapse">
        <thead className="bg-black text-[#FEC00F]">
          <tr>
            <th className="py-2 px-4 border-b text-center">Asset Name</th>
            <th className="py-2 px-4 border-b text-center">Quantity</th>
            <th className="py-2 px-4 border-b text-center">Date Requested</th>
            <th className="py-2 px-4 border-b text-center">Date Archived</th>
            <th className="py-2 px-4 border-b text-center">Requested By</th>
            <th className="py-2 px-4 border-b text-center">Original Status</th>
            <th className="py-2 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRequests.map((asset, index) => (
            <tr
              key={index}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
              } hover:bg-gray-50`}
            >
              <td className="py-2 px-4 border-b text-center">{asset.asset_name}</td>
              <td className="py-2 px-4 border-b text-center">{asset.quantity}</td>
              <td className="py-2 px-4 border-b text-center">
                {moment(asset.created_at).format("MM/DD/YYYY")}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {moment(asset.archived_at).format("MM/DD/YYYY")}
              </td>
              <td className="py-2 px-4 border-b text-center">
                <div className="flex items-center justify-center">
                  <img 
                    src={asset.user_picture || "https://via.placeholder.com/30"} 
                    alt={asset.created_by} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  {asset.created_by}
                </div>
              </td>
              <td className="py-2 px-4 border-b text-center">
                <span className={`px-2 py-1 rounded ${
                  asset.original_status === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {asset.original_status.charAt(0).toUpperCase() + asset.original_status.slice(1)}
                </span>
              </td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  onClick={() => onRestore(asset.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded mr-2 text-xs hover:bg-green-600 transition duration-300"
                >
                  Restore
                </button>
                <button
                  onClick={() => onDelete(asset.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition duration-300"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {archivedRequests.length > 0 && (
        <PaginationControls
          itemsPerPage={itemsPerPage}
          handleItemsPerPageChange={handleItemsPerPageChange}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          calculateStartIndex={calculateStartIndex}
          calculateEndIndex={calculateEndIndex}
          totalItems={archivedRequests.length}
          renderPageNumbers={renderPageNumbers}
        />
      )}
    </div>
  );
};

export default ArchivedRequestTable;
