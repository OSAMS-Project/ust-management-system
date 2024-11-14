import React from "react";

const SupplierInfoCard = ({ totalSuppliers }) => {
  return (
    <div className="px-4">
      <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full px-5 py-1 text-center uppercase tracking-wider mb-3">
        Supplier Summary
      </div>

      {/* Total Suppliers Section */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div
          className="p-6 rounded-lg shadow-md h-48 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-img-4.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative flex flex-col items-center justify-center text-center">
            <h2 className="text-7xl font-bold text-[#FEC00F]">
              {totalSuppliers}
            </h2>
            <p className="text-2xl font-semibold text-white mt-2">
              Total Suppliers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierInfoCard;
