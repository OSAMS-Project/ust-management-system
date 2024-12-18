import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faTrashAlt, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import moment from 'moment';

const TableRow = ({
  asset,
  index,
  visibleColumns,
  handleAssetDetailsClick,
  handleBorrowClick,
  handleEditClick,
  handleDeleteClick,
  handleConsumeClick
}) => {
  return (
    <tr
      className={`${
        index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
      } hover:bg-gray-100 transition-all duration-150 text-lg cursor-pointer`}
      onClick={() => handleAssetDetailsClick(asset)}
    >
      {visibleColumns.dateCreated && (
        <td className="text-center align-middle py-3" data-label="Date Created">
          {moment(asset.createdDate).format("MM/DD/YYYY")}
        </td>
      )}
      {visibleColumns.id && (
        <td className="text-center align-middle py-3" data-label="ID">
          {asset.asset_id}
        </td>
      )}
      {visibleColumns.asset && (
        <td className="text-center align-middle py-3" data-label="Asset">
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
      {visibleColumns.productCode && (
        <td className="text-center align-middle py-3" data-label="Product Code">
          {asset.productCode}
        </td>
      )}
      {visibleColumns.serialNumber && (
        <td className="text-center align-middle py-3" data-label="Serial Number">
          {asset.serialNumber}
        </td>
      )}
      {visibleColumns.costPerUnit && (
        <td className="text-center align-middle py-3" data-label="Cost per Unit">
          ₱{parseFloat(asset.cost).toFixed(2)}
        </td>
      )}
      {visibleColumns.quantity && (
        <td className="text-center align-middle py-3" data-label="Available Quantity">
          {asset.quantity}
        </td>
      )}
      {visibleColumns.quantityForBorrowing && (
        <td className="text-center align-middle py-3" data-label="Borrowing Quantity">
          {asset.is_active
            ? asset.quantity_for_borrowing !== undefined
              ? asset.quantity_for_borrowing
              : "Not set"
            : "N/A"}
        </td>
      )}
      {visibleColumns.totalCost && (
        <td className="text-center align-middle py-3" data-label="Total Cost">
          ₱{parseFloat(asset.totalCost || (asset.cost * asset.quantity)).toFixed(2)}
        </td>
      )}
      {visibleColumns.lastUpdated && (
        <td className="text-center align-middle py-3" data-label="Last Updated">
          {asset.lastUpdated
            ? moment(asset.lastUpdated).format("MM/DD/YYYY")
            : "N/A"}
        </td>
      )}
      {visibleColumns.borrow && (
        <td className="text-center align-middle py-3" data-label="Borrow">
          <button
            className={`w-20 h-8 rounded-full font-semibold text-xs transition-all duration-300 ${
              (asset.type === 'Consumable' && !asset.allow_borrowing)
                ? "bg-gray-400 cursor-not-allowed"
                : asset.is_active
                ? "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700"
                : "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
            }`}
            onClick={(event) => {
              event.stopPropagation();
              if (asset.type !== 'Consumable' || asset.allow_borrowing) {
                handleBorrowClick(asset.asset_id);
              }
            }}
            disabled={asset.type === 'Consumable' && !asset.allow_borrowing}
            aria-label={`Toggle borrow status for ${asset.assetName}`}
          >
            {asset.type === 'Consumable' && !asset.allow_borrowing 
              ? "N/A" 
              : asset.is_active 
              ? "Active" 
              : "Inactive"}
          </button>
        </td>
      )}
      {visibleColumns.Actions && (
        <td className="text-center align-middle px-2 py-3" data-label="Actions">
          <div className="inline-flex items-center justify-center space-x-2">
            <button
              className="asset-action-btn text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(asset);
              }}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="asset-action-btn text-red-600 hover:text-red-800"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(asset);
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
            {asset.type === 'Consumable' && (
              <button
                className="asset-action-btn text-green-600 hover:text-green-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConsumeClick(asset);
                }}
                title="Consume Asset"
              >
                <FontAwesomeIcon icon={faBoxOpen} />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

export default TableRow;