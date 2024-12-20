import React, { useState } from 'react';
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import ViewRequestModal from './ViewRequestModal';

const DeclinedRequestTable = ({ declinedRequests, onArchive }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(declinedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = declinedRequests.slice(startIndex, endIndex);

  return (
    <div className="mt-8 mb-8">
  <h2 className="text-xl sm:text-2xl font-bold mb-4">Declined Requests</h2>
  <div className="overflow-x-auto"> {/* Enable horizontal scrolling for the table */}
    <table className="min-w-full bg-white border-collapse">
      <thead className="bg-black text-[#FEC00F]">
        <tr>
          <th className="py-2 px-4 border-b text-center text-sm sm:text-base">Asset Name</th>
          <th className="py-2 px-4 border-b text-center text-sm sm:text-base">Quantity</th>
          <th className="py-2 px-4 border-b text-center text-sm sm:text-base">Date Requested</th>
          <th className="py-2 px-4 border-b text-center text-sm sm:text-base">Date Declined</th>
          <th className="py-2 px-4 border-b text-center text-sm sm:text-base">Requested By</th>
          <th className="py-2 px-4 border-b text-center text-sm sm:text-base">Status</th>
          <th className="py-2 px-4 border-b text-center text-sm sm:text-base">Actions</th>
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
            <td className="py-2 px-4 border-b text-center text-sm sm:text-base">{asset.asset_name}</td>
            <td className="py-2 px-4 border-b text-center text-sm sm:text-base">{asset.quantity}</td>
            <td className="py-2 px-4 border-b text-center text-sm sm:text-base">
              {moment(asset.created_at).format("MM/DD/YYYY")}
            </td>
            <td className="py-2 px-4 border-b text-center text-sm sm:text-base">
              {moment(asset.declined_at).format("MM/DD/YYYY")}
            </td>
            <td className="py-2 px-4 border-b text-center text-sm sm:text-base">
              <div className="flex items-center justify-center">
                <img
                  src={asset.user_picture || "/osa-img.png"}
                  alt={asset.created_by}
                  className="w-8 h-8 rounded-full mr-2"
                />
                {asset.created_by}
              </div>
            </td>
            <td className="py-2 px-4 border-b text-center text-sm sm:text-base">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                Declined
              </span>
            </td>
            <td className="py-2 px-4 border-b text-center">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRequest(asset);
                    setIsViewModalOpen(true);
                  }}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs sm:text-sm hover:bg-blue-600 transition duration-300"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button
                  onClick={() => onArchive(asset.id)}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-xs sm:text-sm hover:bg-gray-600 transition duration-300"
                >
                  Archive
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination Controls */}
  <div className="mt-4 mb-8 flex justify-center flex-wrap">
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        onClick={() => setCurrentPage(i + 1)}
        className={`mx-1 px-3 py-1 rounded text-sm sm:text-base ${
          currentPage === i + 1
            ? "bg-yellow-500 text-white"
            : "bg-gray-200"
        }`}
      >
        {i + 1}
      </button>
    ))}
  </div>

  <ViewRequestModal
    isOpen={isViewModalOpen}
    onClose={() => setIsViewModalOpen(false)}
    request={selectedRequest}
  />
</div>

  );
};

export default DeclinedRequestTable;
