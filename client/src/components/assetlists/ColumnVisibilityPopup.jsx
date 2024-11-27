import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const ColumnVisibilityPopup = ({
  visibleColumns,
  toggleColumnVisibility,
  onClose,
}) => {
  const columnOrder = [
    'dateCreated',
    'id',
    'asset',
    'productCode',
    'serialNumber',
    'costPerUnit',
    'quantity',
    'quantityForBorrowing',
    'totalCost',
    'lastUpdated',
    'borrow',
    'Actions'
  ];

  const getColumnLabel = (columnName) => {
    switch(columnName) {
      case 'id': return '#';
      case 'productCode': return 'Product Code';
      case 'serialNumber': return 'Serial Number';
      case 'dateCreated': return 'Date Created';
      case 'asset': return 'Asset';
      case 'costPerUnit': return 'Cost per Unit';
      case 'quantity': return 'Available Quantity';
      case 'totalCost': return 'Total Cost';
      case 'borrow': return 'Borrow';
      case 'quantityForBorrowing': return 'Borrowing Quantity';
      case 'lastUpdated': return 'Last Updated';
      default: return columnName.replace(/([A-Z])/g, " $1").trim();
    }
  };

  return (
    <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Toggle Columns</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {columnOrder.map((columnName) => (
          <div key={columnName} className="flex items-center">
            <input
              type="checkbox"
              id={columnName}
              checked={visibleColumns[columnName]}
              onChange={() => toggleColumnVisibility(columnName)}
              className="mr-2"
            />
            <label htmlFor={columnName} className="cursor-pointer">
              {getColumnLabel(columnName)}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColumnVisibilityPopup;