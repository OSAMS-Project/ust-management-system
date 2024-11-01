import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import SupplierDetailsModal from './SupplierDetailsModal';

const SupplierTable = ({ suppliers, onDelete, onEdit }) => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const handleRowClick = (supplier) => {
    setSelectedSupplier(supplier);
  };

  return (
    <>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b">Supplier ID</th>
            <th className="py-2 px-4 border-b">Supplier Name</th>
            <th className="py-2 px-4 border-b">Product</th>
            <th className="py-2 px-4 border-b">Street Address</th>
            <th className="py-2 px-4 border-b">City</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Contact No.</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr 
              key={supplier.supplier_id}
              onClick={() => handleRowClick(supplier)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <td className="py-2 px-4 border-b">{supplier.supplier_id}</td>
              <td className="py-2 px-4 border-b">{supplier.name}</td>
              <td className="py-2 px-4 border-b">{supplier.product}</td>
              <td className="py-2 px-4 border-b">{supplier.streetaddress}</td>
              <td className="py-2 px-4 border-b">{supplier.city}</td>
              <td className="py-2 px-4 border-b">{supplier.email}</td>
              <td className="py-2 px-4 border-b">{supplier.contactno}</td>
              <td className="py-2 px-4 border-b">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(supplier);
                  }} 
                  className="text-blue-500 mr-2"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(supplier.supplier_id);
                  }} 
                  className="text-red-500"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>   
            </tr>
          ))}
        </tbody>
      </table>

      {selectedSupplier && (
        <SupplierDetailsModal
          selectedSupplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
    </>
  );
};

export default SupplierTable;
