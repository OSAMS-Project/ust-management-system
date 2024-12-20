import React from 'react';
import PendingAssetsTable from './PendingAssetsTable';
import ReceivedAssetsTable from './ReceivedAssetsTable';

const Pagination = ({ currentPage, setCurrentPage, totalPages }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-end mt-4">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => setCurrentPage(pageNum)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === pageNum
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {pageNum}
        </button>
      ))}
    </div>
  );
};

const IncomingAssetsTable = ({
  assets = [],
  handleStatusUpdate,
  pendingCurrentPage,
  setPendingCurrentPage,
  receivedCurrentPage,
  setReceivedCurrentPage,
  itemsPerPage = 5,
}) => {
  // Separate pending and received assets
  const pendingAssets = assets.filter((asset) => asset.status !== 'received');
  const receivedAssets = assets.filter((asset) => asset.status === 'received');

  // Pagination helpers
  const getPendingTotalPages = () => Math.ceil(pendingAssets.length / itemsPerPage);
  const getReceivedTotalPages = () => Math.ceil(receivedAssets.length / itemsPerPage);

  const getPendingPageData = () => {
    const startIndex = (pendingCurrentPage - 1) * itemsPerPage;
    return pendingAssets.slice(startIndex, startIndex + itemsPerPage);
  };

  const getReceivedPageData = () => {
    const startIndex = (receivedCurrentPage - 1) * itemsPerPage;
    return receivedAssets.slice(startIndex, startIndex + itemsPerPage);
  };

  return (
    <div className="overflow-x-auto">
      {/* Pending Assets Section */}
      <div id="recipients" className="p-4 lg:mt-0 rounded bg-white">
        <PendingAssetsTable
          pendingAssets={getPendingPageData()}
          handleStatusUpdate={handleStatusUpdate}
        />
        <Pagination
          currentPage={pendingCurrentPage}
          setCurrentPage={setPendingCurrentPage}
          totalPages={getPendingTotalPages()}
        />
      </div>

      {/* Received Assets Section */}
      <div id="recipients" className="p-4 mt-4 lg:mt-0 rounded bg-white">
        <ReceivedAssetsTable receivedAssets={getReceivedPageData()} />
        <Pagination
          currentPage={receivedCurrentPage}
          setCurrentPage={setReceivedCurrentPage}
          totalPages={getReceivedTotalPages()}
        />
      </div>
    </div>
  );
};

export default IncomingAssetsTable;
