import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faColumns,
  faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import AssetDetailsModal from "./AssetDetailsModal";
import EditAssetModal from "./EditAssetModal";
import axios from "axios";
import moment from "moment";
import { CSVLink } from "react-csv";
import ConfirmationModal from "../utils/DeleteConfirmationModal";
import QuantityForBorrowingModal from "./QuantityForBorrowing";
import PaginationControls from "./PaginationControls";
import NotificationPopup from "../utils/NotificationsPopup";

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
    lastUpdated: true,
    quantityForBorrowing: true,
    Actions: true,
  };
};

const ColumnVisibilityPopup = ({
  visibleColumns,
  toggleColumnVisibility,
  onClose,
}) => {
  return (
    <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4">
      <h3 className="text-lg font-semibold mb-2">Toggle Columns</h3>
      <div className="space-y-2">
        {Object.entries(visibleColumns).map(([columnName, isVisible]) => (
          <div key={columnName} className="flex items-center">
            <input
              type="checkbox"
              id={columnName}
              checked={isVisible}
              onChange={() => toggleColumnVisibility(columnName)}
              className="mr-2"
            />
            <label htmlFor={columnName} className="cursor-pointer">
              {columnName === 'id' ? '#' : 
              columnName === 'productCode' ? 'Product Code' :
               columnName === 'dateCreated' ? 'Date Created' :
               columnName === 'asset' ? 'Asset' :
               columnName === 'costPerUnit' ? 'Cost per Unit' :
               columnName === 'quantity' ? 'Available Quantity' :
               columnName === 'totalCost' ? 'Total Cost' :
               columnName === 'borrow' ? 'Borrow' :
               columnName === 'quantityForBorrowing' ? 'Borrowing Quantity' :
               columnName === 'lastUpdated' ? 'Last Updated' :
               columnName.replace(/([A-Z])/g, " $1").trim()}
            </label>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
      >
        Close
      </button>
    </div>
  );
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
  const [selectedAssetForBorrowing, setSelectedAssetForBorrowing] =
    useState(null);
  const [borrowingRequests, setBorrowingRequests] = useState([]);
  const [notification, setNotification] = useState(null); // Add this state

  const totalPages = Math.ceil(assets.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssets = assets.slice(startIndex, endIndex);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/Assets/read`
      );
      console.log("Fetched assets:", response.data);
      const updatedAssets = response.data.map((asset) => ({
        ...asset,
        lastUpdated: asset.lastUpdated ? moment(asset.lastUpdated) : null,
      }));
      setAssets(updatedAssets);
      const activeCount = updatedAssets.filter(
        (asset) => asset.is_active
      ).length;
      onBorrowingChange(activeCount);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("No assets found or error in fetching assets");
        setAssets([]);
        onBorrowingChange(0);
      } else {
        console.error("Error fetching assets:", error);
      }
    }
  };

  const fetchBorrowingRequests = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests`
      );
      setBorrowingRequests(response.data);
    } catch (error) {
      console.error("Error fetching borrowing requests:", error);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchBorrowingRequests();
  }, []);

  const handleBorrowClick = async (assetID) => {
    const asset = assets.find((a) => a.asset_id === assetID);
    if (asset.is_active) {
      // If the asset is already active, deactivate it
      try {
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
                } // Return the quantity for borrowing
              : a
          );
          setAssets(updatedAssets);
          const newActiveCount = updatedAssets.filter(
            (a) => a.is_active
          ).length;
          onBorrowingChange(newActiveCount);
          setNotification({
            type: "success",
            message: `${asset.assetName} has been deactivated for borrowing.`,
          });
        }
      } catch (error) {
        console.error("Error updating asset active status:", error);
        setNotification({
          type: "error",
          message: `Failed to deactivate ${asset.assetName} for borrowing.`,
        });
      }
    } else {
      // If the asset is inactive, open the quantity modal
      setSelectedAssetForBorrowing(asset);
      setIsQuantityModalOpen(true);
    }
  };

  const handleCloseImageModal = () => {
    setSelectedImage(null);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleAssetDetailsClick = (asset) => {
    setSelectedAsset(asset);
  };

  const handleEditClick = (asset) => {
    setEditingAsset(asset);
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

  const handleDeleteClick = (asset) => {
    setAssetToDelete(asset);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (assetToDelete) {
      try {
        await onDeleteAsset(assetToDelete.asset_id);
        setAssets((prevAssets) =>
          prevAssets.filter(
            (asset) => asset.asset_id !== assetToDelete.asset_id
          )
        );
        const updatedAssets = assets.filter(
          (asset) => asset.asset_id !== assetToDelete.asset_id
        );
        const activeCount = updatedAssets.filter(
          (asset) => asset.is_active
        ).length;
        onBorrowingChange(activeCount);
        setIsDeleteModalOpen(false);
        setAssetToDelete(null);
      } catch (error) {
        console.error("Error deleting asset:", error);
        if (error.response && error.response.status === 404) {
          // If the asset is not found, remove it from the local state anyway
          setAssets((prevAssets) =>
            prevAssets.filter(
              (asset) => asset.asset_id !== assetToDelete.asset_id
            )
          );
          setIsDeleteModalOpen(false);
          setAssetToDelete(null);
        }
      }
    }
  };

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

  const toggleColumnVisibility = (columnName) => {
    const updatedColumns = {
      ...visibleColumns,
      [columnName]: !visibleColumns[columnName],
    };
    setVisibleColumns(updatedColumns);
    localStorage.setItem('visibleColumns', JSON.stringify(updatedColumns));
  };

  const handleQuantityConfirm = async (quantity) => {
    console.log(
      "Before update - selectedAssetForBorrowing:",
      selectedAssetForBorrowing
    );
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
      console.log("Update active status response:", response.data);
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

  // Remove these lines as they're already defined earlier in your code
  // const totalResults = assets.length;
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = Math.min(startIndex + itemsPerPage, totalResults);

  // Add these functions to calculate startIndex and endIndex
  const calculateStartIndex = () => (currentPage - 1) * itemsPerPage + 1;
  const calculateEndIndex = () =>
    Math.min(calculateStartIndex() + itemsPerPage - 1, assets.length);

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

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="relative p-3 w-full text-[20px]">
      <div className="mb-4 flex justify-end space-x-2">
        <button
          onClick={() => setIsColumnPopupOpen(!isColumnPopupOpen)}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 shadow-md flex items-center justify-center"
          title="Toggle column visibility"
        >
          <FontAwesomeIcon icon={faColumns} className="text-lg" />
        </button>
        <CSVLink
          data={prepareCSVData()}
          filename={"asset_data.csv"}
          className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all duration-300 shadow-md flex items-center justify-center"
          title="Export to CSV"
        >
          <FontAwesomeIcon icon={faFileExport} className="text-lg" />
        </CSVLink>
      </div>
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
            <tr className="bg-black text-[#FEC00F] text-lg">
              {visibleColumns.id && <th className="text-center py-2 px-4">#</th>}
              {visibleColumns.productCode && <th className="text-center py-2 px-4">Product Code</th>}
              {visibleColumns.dateCreated && <th className="text-center py-2 px-4">Date Created</th>}
              {visibleColumns.asset && <th className="text-center py-2 px-4">Asset</th>}
              {visibleColumns.costPerUnit && <th className="text-center py-2 px-4">Cost per Unit</th>}
              {visibleColumns.quantity && <th className="text-center py-2 px-4">Available Quantity</th>}
              {visibleColumns.totalCost && <th className="text-center py-2 px-4">Total Cost</th>}
              {visibleColumns.borrow && <th className="text-center py-2 px-4">Borrow</th>}
              {visibleColumns.quantityForBorrowing && <th className="text-center py-2 px-4">Borrowing Quantity</th>}
              {visibleColumns.lastUpdated && <th className="text-center py-2 px-4">Last Updated</th>}
              {visibleColumns.Actions && <th className="text-center px-2 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentAssets.map((asset, index) => (
              <tr
                key={asset.asset_id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
                } hover:bg-gray-100 transition-all duration-150 text-lg cursor-pointer`}
                onClick={() => handleAssetDetailsClick(asset)}
              >
                {visibleColumns.id && (
                  <td className="text-center align-middle py-3" data-label="ID">
                    {asset.asset_id}
                  </td>
                )}
                {visibleColumns.productCode && (
                  <td className="text-center align-middle py-3" data-label="Product Code">
                    {asset.productCode}
                  </td>
                )}
                {visibleColumns.dateCreated && (
                  <td
                    className="text-center align-middle py-3"
                    data-label="Date Created"
                  >
                    {moment(asset.createdDate).format("MM/DD/YYYY")}
                  </td>
                )}
                {visibleColumns.asset && (
                  <td
                    className="text-center align-middle py-3"
                    data-label="Asset"
                  >
                    <div className="inline-flex items-center justify-center">
                      {asset.image && (
                        <img
                          src={asset.image}
                          alt={asset.assetName}
                          className="asset-image mr-2 h-8 w-8 rounded-full border"
                        />
                      )}
                      <span>{asset.assetName}</span>
                    </div>
                  </td>
                )}
                {visibleColumns.costPerUnit && (
                  <td
                    className="text-center align-middle py-3"
                    data-label="Cost per Unit"
                  >
                    ₱{parseFloat(asset.cost).toFixed(2)}
                  </td>
                )}
                {visibleColumns.quantity && (
                  <td
                    className="text-center align-middle py-3"
                    data-label="Available Quantity"
                  >
                    {asset.quantity}
                  </td>
                )}
                {visibleColumns.totalCost && (
                  <td
                    className="text-center align-middle py-3"
                    data-label="Total Cost"
                  >
                    ₱{(parseFloat(asset.cost) * asset.quantity).toFixed(2)}
                  </td>
                )}
                {visibleColumns.borrow && (
                  <td
                    className="text-center align-middle py-3"
                    data-label="Borrow"
                  >
                    <button
                      className={`w-20 h-8 rounded-full font-semibold text-xs transition-all duration-300 ${
                        asset.is_active
                          ? "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700"
                          : "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
                      }`}
                      onClick={(event) => {
                        event.stopPropagation(); // Prevent row click when "Borrow" button is clicked
                        handleBorrowClick(asset.asset_id);
                      }}
                      aria-label={`Toggle borrow status for ${asset.assetName}`}
                    >
                      {asset.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                )}
                {visibleColumns.quantityForBorrowing && (
                  <td
                    className="text-center align-middle py-3"
                    data-label="Borrowing Quantity"
                  >
                    {asset.is_active
                      ? asset.quantity_for_borrowing !== undefined
                        ? asset.quantity_for_borrowing
                        : "Not set"
                      : "N/A"}
                  </td>
                )}
                {visibleColumns.lastUpdated && (
                  <td
                    className="text-center align-middle py-3"
                    data-label="Last Updated"
                  >
                    {asset.lastUpdated
                      ? moment(asset.lastUpdated).format("MM/DD/YYYY")
                      : "N/A"}
                  </td>
                )}
                {visibleColumns.Actions && (
                  <td
                    className="text-center align-middle px-2 py-3"
                    data-label="Actions"
                  >
                    <div className="inline-flex items-center justify-center space-x-2">
                      <button
                        className="asset-action-btn text-blue-600 hover:text-blue-800"
                        onClick={(event) => {
                          event.stopPropagation(); // Prevent row click when "Edit" button is clicked
                          handleEditClick(asset);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="asset-action-btn text-red-600 hover:text-red-800"
                        onClick={(event) => {
                          event.stopPropagation(); // Prevent row click when "Delete" button is clicked
                          handleDeleteClick(asset);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Updated Pagination Controls with Rows per Page */}
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

      {/* Modal for enlarged image */}
      {selectedImage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <img
              src={selectedImage}
              alt="Enlarged Asset"
              className="h-96 w-96 object-cover"
            />
            <button className="modal-close-btn" onClick={handleCloseImageModal}>
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {selectedAsset && (
        <AssetDetailsModal
          selectedAsset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}

      {/* Edit Asset Modal */}
      <EditAssetModal
        isOpen={editingAsset !== null}
        onClose={() => setEditingAsset(null)}
        asset={editingAsset}
        categories={categories}
        locations={locations}
        onEditAsset={handleEditAsset}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        message={`Are you sure you want to delete the asset "${assetToDelete?.assetName}"? This action cannot be undone.`}
      />

      <QuantityForBorrowingModal
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        onConfirm={handleQuantityConfirm}
        maxQuantity={
          selectedAssetForBorrowing ? selectedAssetForBorrowing.quantity : 1
        }
      />

      <NotificationPopup
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default AssetTable;
