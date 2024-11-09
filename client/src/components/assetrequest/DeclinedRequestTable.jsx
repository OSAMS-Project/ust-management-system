import React, { useState } from 'react';
import moment from 'moment';

const DeclinedRequestTable = ({ declinedRequests, onArchive }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(declinedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = declinedRequests.slice(startIndex, endIndex);

  return (
    <div className="mt-8 mb-8">
      <h2 className="text-2xl font-bold mb-4">Declined Requests</h2>
      <table className="min-w-full bg-white border-collapse">
        <thead className="bg-black text-[#FEC00F]">
          <tr>
            <th className="py-2 px-4 border-b text-center">Asset Name</th>
            <th className="py-2 px-4 border-b text-center">Quantity</th>
            <th className="py-2 px-4 border-b text-center">Date Created</th>
            <th className="py-2 px-4 border-b text-center">Date Declined</th>
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
                {moment(asset.created_at).format("MM/DD/YYYY")}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {moment(asset.declined_at).format("MM/DD/YYYY")}
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
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                  Declined
                </span>
              </td>
              <td className="py-2 px-4 border-b text-center">
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
    </div>
  );
};

export default DeclinedRequestTable;
