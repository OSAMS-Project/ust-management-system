import React, { useState, useEffect, useMemo } from "react";
import TableControls from './TableControls';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import ColumnVisibilityPopup from './ColumnVisibilityPopup';
import PaginationControls from './PaginationControls';
import AssetModals from './AssetModals';
import axios from "axios";
import moment from "moment";

const getInitialVisibleColumns = () => {
  const savedColumns = localStorage.getItem('visibleColumns');
  if (savedColumns) {
    return JSON.parse(savedColumns);
  }
  return {
    id: true,
    productCode: true,
    dateCreated: true,
    asset: true,
    costPerUnit: true,
    quantity: true,
    totalCost: true,
    borrow: true,
    quantityForBorrowing: true,
    lastUpdated: true,
    Actions: true,
  };
};

const AssetTable = ({
  assets,
  setAssets,
  categories,
  locations,
  onDeleteAsset,
  onEditAsset,
  onBorrowingChange,
  updateAssetQuantity,
}) => {
  // State declarations
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(getInitialVisibleColumns());
  const [isColumnPopupOpen, setIsColumnPopupOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [selectedAssetForBorrowing, setSelectedAssetForBorrowing] = useState(null);
  const [borrowingRequests, setBorrowingRequests] = useState([]);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCriteria, setSortCriteria] = useState({ field: '', direction: 'asc' });

  // Handlers
  const handleCloseImageModal = () => {
    setSelectedImage(null);
  };

  const handleAssetDetailsClick = (asset) => {
    setSelectedAsset(asset);
  };

  const handleEditClick = (asset) => {
    setEditingAsset(asset);
  };

  const handleDeleteClick = (asset) => {
    setAssetToDelete(asset);
    setIsDeleteModalOpen(true);
  };

  const handleEditAsset = async (editedAsset) => {
    const previousAsset = assets.find(
      (asset) => asset.asset_id === editedAsset.asset_id
    );
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/Assets/update/${editedAsset.asset_id}`,
        editedAsset
      );
      const updatedAsset = response.data;
      setAssets((prevAssets) =>
        prevAssets.map((asset) =>
          asset.asset_id === updatedAsset.asset_id ? updatedAsset : asset
        )
      );
      onEditAsset(updatedAsset, previousAsset);
      setEditingAsset(null);
    } catch (error) {
      console.error("Error updating asset:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (assetToDelete) {
      try {
        await onDeleteAsset(assetToDelete.asset_id);
        setAssets((prevAssets) =>
          prevAssets.filter((asset) => asset.asset_id !== assetToDelete.asset_id)
        );
        setIsDeleteModalOpen(false);
        setAssetToDelete(null);
      } catch (error) {
        console.error("Error deleting asset:", error);
      }
    }
  };

  const handleBorrowClick = async (assetID) => {
    const asset = assets.find((a) => a.asset_id === assetID);
    
    if (asset.type === 'Consumable') {
      setNotification({
        type: "error",
        message: "Consumable assets cannot be borrowed."
      });
      return;
    }

    if (asset.under_maintenance) {
      setNotification({
        type: "error",
        message: `${asset.assetName} is currently under maintenance and cannot be borrowed.`
      });
      return;
    }

    if (asset.is_active) {
      try {
        const pendingRequests = borrowingRequests.filter(request => 
          request.status === "Pending" && 
          request.selected_assets.some(selectedAsset => 
            selectedAsset.asset_id === assetID
          )
        );

        for (const request of pendingRequests) {
          try {
            await axios.delete(
              `${process.env.REACT_APP_API_URL}/api/borrowing-requests/${request.id}`
            );
          } catch (deleteError) {
            console.error(`Error deleting request ${request.id}:`, deleteError);
          }
        }

        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/assets/${assetID}/active`,
          { isActive: false }
        );

        if (response.data) {
          const updatedAssets = assets.map((a) =>
            a.asset_id === assetID
              ? {
                  ...a,
                  is_active: false,
                  quantity_for_borrowing: 0,
                  quantity: a.quantity + a.quantity_for_borrowing,
                }
              : a
          );
          setAssets(updatedAssets);
          const newActiveCount = updatedAssets.filter((a) => a.is_active).length;
          onBorrowingChange(newActiveCount);

          setBorrowingRequests(prevRequests => 
            prevRequests.filter(request => 
              !pendingRequests.some(pendingReq => pendingReq.id === request.id)
            )
          );

          setNotification({
            type: "success",
            message: `${asset.assetName} has been deactivated for borrowing${pendingRequests.length > 0 ? ' and pending requests have been removed' : ''}.`,
          });
        }
      } catch (error) {
        console.error("Error updating asset active status:", error);
        setNotification({
          type: "error",
          message: `Failed to deactivate ${asset.assetName} for borrowing. ${error.response?.data?.message || error.message}`,
        });
      }
    } else {
      setSelectedAssetForBorrowing(asset);
      setIsQuantityModalOpen(true);
    }
  };

  const handleQuantityConfirm = async (quantity) => {
    try {
      const maxQuantity = Math.min(
        quantity,
        selectedAssetForBorrowing.quantity
      );
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/assets/${selectedAssetForBorrowing.asset_id}/active`,
        {
          isActive: true,
          quantityForBorrowing: maxQuantity,
        }
      );

      if (response.data) {
        const updatedAssets = assets.map((a) =>
          a.asset_id === selectedAssetForBorrowing.asset_id
            ? {
                ...a,
                is_active: true,
                quantity_for_borrowing: maxQuantity,
                quantity: a.quantity - maxQuantity,
              }
            : a
        );
        setAssets(updatedAssets);
        const newActiveCount = updatedAssets.filter((a) => a.is_active).length;
        onBorrowingChange(newActiveCount);
        setNotification({
          type: "success",
          message: `${selectedAssetForBorrowing.assetName} has been activated for borrowing with quantity ${maxQuantity}.`,
        });
      }
    } catch (error) {
      console.error("Error updating asset active status and quantity:", error);
      setNotification({
        type: "error",
        message: `Failed to activate ${selectedAssetForBorrowing.assetName} for borrowing.`,
      });
    }
    setIsQuantityModalOpen(false);
    setSelectedAssetForBorrowing(null);
  };

  const handleSort = (field) => {
    setSortCriteria(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const toggleColumnVisibility = (columnName) => {
    const updatedColumns = {
      ...visibleColumns,
      [columnName]: !visibleColumns[columnName],
    };
    setVisibleColumns(updatedColumns);
    localStorage.setItem('visibleColumns', JSON.stringify(updatedColumns));
  };

  // Calculations
  const calculateStartIndex = () => (currentPage - 1) * itemsPerPage + 1;
  const calculateEndIndex = () => Math.min(calculateStartIndex() + itemsPerPage - 1, assets.length);
  const totalPages = Math.ceil(assets.length / itemsPerPage);

  // Filtered and sorted assets
  const currentAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        if (asset.under_maintenance) return false;
        return asset.assetName.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        if (!sortCriteria.field) return 0;
        const direction = sortCriteria.direction === 'asc' ? 1 : -1;
        
        switch (sortCriteria.field) {
          case 'asset_id':
            return direction * (a.asset_id - b.asset_id);
          case 'productCode':
            return direction * a.productCode.localeCompare(b.productCode);
          case 'createdDate':
            return direction * (new Date(a.createdDate) - new Date(b.createdDate));
          case 'assetName':
            return direction * a.assetName.localeCompare(b.assetName);
          case 'cost':
            return direction * (parseFloat(a.cost) - parseFloat(b.cost));
          case 'quantity':
            return direction * (a.quantity - b.quantity);
          case 'totalCost':
            return direction * ((a.cost * a.quantity) - (b.cost * b.quantity));
          case 'lastUpdated':
            if (!a.lastUpdated) return direction;
            if (!b.lastUpdated) return -direction;
            return direction * (new Date(a.lastUpdated) - new Date(b.lastUpdated));
          default:
            return 0;
        }
      })
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [assets, searchQuery, sortCriteria, currentPage, itemsPerPage]);

  const prepareCSVData = () => {
    const headers = [
      "ID",
      "Product Code",
      "Date Created",
      "Asset Name",
      "Cost per Unit",
      "Quantity",
      "Total Cost",
      "Is Active",
      "Last Updated",
      "Category",
      "Location",
      "Type",
      "Details",
    ];

    const csvData = assets.map((asset) => [
      asset.asset_id,
      asset.productCode,
      moment(asset.createdDate).format("MM/DD/YYYY"),
      asset.assetName,
      parseFloat(asset.cost).toFixed(2),
      asset.quantity,
      (parseFloat(asset.cost) * asset.quantity).toFixed(2),
      asset.is_active ? "Yes" : "No",
      asset.lastUpdated
        ? moment(asset.lastUpdated).format("MM/DD/YYYY HH:mm:ss")
        : "N/A",
      asset.category,
      asset.location,
      asset.type,
      asset.assetDetails,
    ]);

    return [headers, ...csvData];
  };

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

  // Component render
  return (
    <div className="relative p-3 w-full text-[20px]">
      <TableControls 
        onToggleColumns={() => setIsColumnPopupOpen(!isColumnPopupOpen)}
        prepareCSVData={prepareCSVData}
      />

      {isColumnPopupOpen && (
        <ColumnVisibilityPopup
          visibleColumns={visibleColumns}
          toggleColumnVisibility={toggleColumnVisibility}
          onClose={() => setIsColumnPopupOpen(false)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="asset-table w-full min-w-[750px]">
          <thead>
            <TableHeader 
              visibleColumns={visibleColumns}
              sortCriteria={sortCriteria}
              handleSort={handleSort}
            />
          </thead>
          <tbody>
            {currentAssets.map((asset, index) => (
              <TableRow
                key={asset.asset_id}
                asset={asset}
                index={index}
                visibleColumns={visibleColumns}
                handleAssetDetailsClick={handleAssetDetailsClick}
                handleBorrowClick={handleBorrowClick}
                handleEditClick={handleEditClick}
                handleDeleteClick={handleDeleteClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls
        itemsPerPage={itemsPerPage}
        handleItemsPerPageChange={handleItemsPerPageChange}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        calculateStartIndex={calculateStartIndex}
        calculateEndIndex={calculateEndIndex}
        totalItems={assets.length}
        renderPageNumbers={renderPageNumbers}
      />

      <AssetModals
        selectedImage={selectedImage}
        selectedAsset={selectedAsset}
        editingAsset={editingAsset}
        isDeleteModalOpen={isDeleteModalOpen}
        assetToDelete={assetToDelete}
        isQuantityModalOpen={isQuantityModalOpen}
        selectedAssetForBorrowing={selectedAssetForBorrowing}
        notification={notification}
        handleCloseImageModal={handleCloseImageModal}
        setSelectedAsset={setSelectedAsset}
        handleEditAsset={handleEditAsset}
        setEditingAsset={setEditingAsset}
        handleDeleteConfirm={handleDeleteConfirm}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        handleQuantityConfirm={handleQuantityConfirm}
        setIsQuantityModalOpen={setIsQuantityModalOpen}
        setNotification={setNotification}
        categories={categories}
        locations={locations}
      />
    </div>
  );
};

export default AssetTable;
