import React, { useState } from 'react';
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import ViewRequestModal from './ViewRequestModal';

const ApprovedRequestTable = ({ approvedRequests, onArchive }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(approvedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = approvedRequests.slice(startIndex, endIndex);

  const formatDate = (date) => {
    return date ? moment(date).format("MM/DD/YYYY") : "N/A";
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Approved Requests</h2>
      <table className="min-w-full bg-white border-collapse">
        <thead className="bg-black text-[#FEC00F]">
          <tr>
            <th className="py-2 px-4 border-b text-center">Asset Name</th>
            <th className="py-2 px-4 border-b text-center">Quantity</th>
            <th className="py-2 px-4 border-b text-center">Date Requested</th>
            <th className="py-2 px-4 border-b text-center">Date Approved</th>
            <th className="py-2 px-4 border-b text-center">Requested By</th>
            <th className="py-2 px-4 border-b text-center">Status</th>
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
                {formatDate(asset.created_at)}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {formatDate(asset.approved_at)}
              </td>
              <td className="py-2 px-4 border-b text-center">
                <div className="flex items-center justify-center">
                  <img 
                    src={asset.user_picture || "/osa-img.png"} 
                    alt={asset.created_by} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  {asset.created_by}
                </div>
              </td>
              <td className="py-2 px-4 border-b text-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Approved
                </span>
              </td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  onClick={() => {
                    setSelectedRequest(asset);
                    setIsViewModalOpen(true);
                  }}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-xs hover:bg-blue-600 transition duration-300"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
                <button
                  onClick={() => onArchive(asset.id)}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 transition duration-300"
                >
                  Archive
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
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
      <ViewRequestModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        request={selectedRequest}
      />
    </div>
  );
};

export default ApprovedRequestTable;
