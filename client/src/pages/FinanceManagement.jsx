import React from "react";

const FinanceManagement = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">QR Code Bulk Generator</h1>
      <p className="mb-4">
        This is a placeholder for the QR Code Bulk Printing component.
      </p>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-2">QR Codes</h2>
        <div className="mb-4">
          {/* Placeholder QR codes */}
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded border">QR Code 1</div>
            <div className="bg-white p-4 rounded border">QR Code 2</div>
            <div className="bg-white p-4 rounded border">QR Code 3</div>
          </div>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add New QR Code
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <div className="flex gap-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            Generate QR Codes
          </button>
          <button className="bg-red-500 text-white px-4 py-2 rounded">
            Bulk Print QR Codes
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceManagement;
