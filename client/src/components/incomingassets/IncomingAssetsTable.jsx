import React, { useState, useEffect } from 'react';
import PendingAssetsTable from './PendingAssetsTable';
import ReceivedAssetsTable from './ReceivedAssetsTable';

const IncomingAssetsTable = ({ 
  assets = [],
  handleStatusUpdate,
  pendingCurrentPage,
  setPendingCurrentPage,
  receivedCurrentPage,
  setReceivedCurrentPage,
  itemsPerPage = 5,
  receivedAssets = [],
}) => {
  const pendingAssets = assets.filter(asset => asset.status !== 'received');

  useEffect(() => {
    setPendingCurrentPage(1);
  }, [assets.length]);

  useEffect(() => {
    setReceivedCurrentPage(1);
  }, [receivedAssets.length]);

  return (
    <div className="overflow-x-auto">
      <PendingAssetsTable
        pendingAssets={pendingAssets}
        handleStatusUpdate={handleStatusUpdate}
        currentPage={pendingCurrentPage}
        setCurrentPage={setPendingCurrentPage}
        itemsPerPage={itemsPerPage}
      />
      
      <ReceivedAssetsTable
        receivedAssets={receivedAssets}
        currentPage={receivedCurrentPage}
        setCurrentPage={setReceivedCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default IncomingAssetsTable;