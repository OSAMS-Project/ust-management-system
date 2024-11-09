import React from 'react';

const ColumnVisibilityPopup = ({
  visibleColumns,
  toggleColumnVisibility,
  onClose,
}) => {
  const getColumnLabel = (columnName) => {
    switch(columnName) {
      case 'id': return '#';
      case 'productCode': return 'Product Code';
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
      <h3 className="text-lg font-semibold mb-2">Toggle Columns</h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
              {getColumnLabel(columnName)}
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

export default ColumnVisibilityPopup; 