import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

const SupplierInfoCard = ({ totalSuppliers }) => {
  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-3 mr-4">
            <FontAwesomeIcon icon={faUsers} className="text-blue-500 text-xl" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-600">Total Suppliers</h2>
            <p className="text-2xl font-bold text-gray-800 mt-1">{totalSuppliers}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierInfoCard;
