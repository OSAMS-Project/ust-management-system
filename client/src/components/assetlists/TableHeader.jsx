import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";

const TableHeader = ({ visibleColumns, sortCriteria, handleSort }) => {
  const renderSortIcon = (field) => (
    <FontAwesomeIcon 
      icon={sortCriteria.field === field 
        ? sortCriteria.direction === 'asc' ? faSortUp : faSortDown 
        : faSort} 
      className="ml-2"
    />
  );

  return (
    <tr className="bg-black text-[#FEC00F] text-lg">
      {visibleColumns.dateCreated && (
        <th 
          className="text-center py-2 px-4 cursor-pointer"
          onClick={() => handleSort('createdDate')}
        >
          <div className="flex items-center justify-center">
            Date Created
            {renderSortIcon('createdDate')}
          </div>
        </th>
      )}
      {visibleColumns.id && (
        <th 
          className="text-center py-2 px-4 cursor-pointer"
          onClick={() => handleSort('asset_id')}
        >
          <div className="flex items-center justify-center">
            #
            {renderSortIcon('asset_id')}
          </div>
        </th>
      )}
      {visibleColumns.asset && (
        <th 
          className="text-center py-2 px-4 cursor-pointer"
          onClick={() => handleSort('assetName')}
        >
          <div className="flex items-center justify-center">
            Asset
            {renderSortIcon('assetName')}
          </div>
        </th>
      )}
      {visibleColumns.productCode && (
        <th 
          className="text-center py-2 px-4 cursor-pointer"
          onClick={() => handleSort('productCode')}
        >
          <div className="flex items-center justify-center">
            Product Code
            {renderSortIcon('productCode')}
          </div>
        </th>
      )}
      {visibleColumns.serialNumber && (
        <th 
          className="text-center py-2 px-4 cursor-pointer"
          onClick={() => handleSort('serialNumber')}
        >
          <div className="flex items-center justify-center">
            Serial Number
            {renderSortIcon('serialNumber')}
          </div>
        </th>
      )}
      {visibleColumns.costPerUnit && (
        <th 
          className="text-center py-2 px-4 cursor-pointer"
          onClick={() => handleSort('cost')}
        >
          <div className="flex items-center justify-center">
            Cost per Unit
            {renderSortIcon('cost')}
          </div>
        </th>
      )}
      {visibleColumns.quantity && (
        <th 
          className="text-center py-2 px-4 cursor-pointer"
          onClick={() => handleSort('quantity')}
        >
          <div className="flex items-center justify-center">
            Available Quantity
            {renderSortIcon('quantity')}
          </div>
        </th>
      )}
      {visibleColumns.quantityForBorrowing && (
        <th className="text-center py-2 px-4">
          <div className="flex items-center justify-center">
            Borrowing Quantity
          </div>
        </th>
      )}
      {visibleColumns.totalCost && (
        <th 
          className="text-center py-2 px-4 cursor-pointer"
          onClick={() => handleSort('totalCost')}
        >
          <div className="flex items-center justify-center">
            Total Cost
            {renderSortIcon('totalCost')}
          </div>
        </th>
      )}
      {visibleColumns.lastUpdated && (
        <th 
          className="text-center py-2 px-4 cursor-pointer"
          onClick={() => handleSort('lastUpdated')}
        >
          <div className="flex items-center justify-center">
            Last Updated
            {renderSortIcon('lastUpdated')}
          </div>
        </th>
      )}
      {visibleColumns.borrow && (
        <th className="text-center py-2 px-4">
          <div className="flex items-center justify-center">
            Borrow
          </div>
        </th>
      )}
      {visibleColumns.Actions && (
        <th className="text-center px-2 py-3">
          <div className="flex items-center justify-center">
            Actions
          </div>
        </th>
      )}
    </tr>
  );
};

export default TableHeader;