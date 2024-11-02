import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import SupplierActivityLogs from './SupplierActivityLogs';

const SupplierDetailsModal = ({ selectedSupplier, onClose }) => {
  const [showActivityLogs, setShowActivityLogs] = useState(false);

  if (!selectedSupplier) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xl" />
        </button>
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">{selectedSupplier.name}</h2>

          <div className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-8">
            <DetailItem label="Supplier ID" value={selectedSupplier.supplier_id} />
            <DetailItem label="Name" value={selectedSupplier.name} />
            <DetailItem label="Product" value={selectedSupplier.product} />
            <DetailItem label="Street Address" value={selectedSupplier.streetaddress} />
            <DetailItem label="City" value={selectedSupplier.city} />
            <DetailItem label="Email" value={selectedSupplier.email} />
            <DetailItem label="Contact No" value={selectedSupplier.contactno} />
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowActivityLogs(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105"
            >
              View Activity Logs
            </button>
          </div>
        </div>
      </div>

      {showActivityLogs && (
        <SupplierActivityLogs
          supplierId={selectedSupplier.supplier_id}
          onClose={() => setShowActivityLogs(false)}
        />
      )}
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 py-2 last:border-b-0">
    <span className="font-semibold text-gray-600">{label}:</span>
    <span className="text-gray-800 sm:text-right">{value}</span>
  </div>
);

export default SupplierDetailsModal;