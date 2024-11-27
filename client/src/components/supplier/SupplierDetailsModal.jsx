import React, { useState } from 'react';
import SupplierActivityLogs from './SupplierActivityLogs';

const SupplierDetailsModal = ({ selectedSupplier, onClose }) => {
  const [showActivityLogs, setShowActivityLogs] = useState(false);

  if (!selectedSupplier) return null;

  const DetailItem = ({ label, value }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="w-full px-3 py-2 border rounded-lg bg-gray-50">
        {value || 'N/A'}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto transform transition-all animate-fadeIn font-roboto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Supplier Details</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Grid layout for details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Supplier ID" value={selectedSupplier.supplier_id} />
              <DetailItem label="Name" value={selectedSupplier.name} />
              <DetailItem label="Product" value={selectedSupplier.product} />
              <DetailItem label="Street Address" value={selectedSupplier.streetaddress} />
              <DetailItem label="City" value={selectedSupplier.city} />
              <DetailItem label="Email" value={selectedSupplier.email} />
              <DetailItem label="Contact No" value={selectedSupplier.contactno} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setShowActivityLogs(true)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
              >
                View Activity Logs
              </button>
            </div>
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

export default SupplierDetailsModal;