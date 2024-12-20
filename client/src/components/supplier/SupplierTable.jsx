import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import SupplierDetailsModal from "./SupplierDetailsModal";
import DeleteConfirmationModal from "../utils/DeleteConfirmationModal";

const SupplierTable = ({ suppliers, onDelete, onEdit }) => {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const handleRowClick = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleDeleteClick = (e, supplierId, supplierName) => {
    e.stopPropagation();
    setSupplierToDelete({ id: supplierId, name: supplierName });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      onDelete(supplierToDelete.id);
      setDeleteModalOpen(false);
      setSupplierToDelete(null);
    }
  };

  return (
    <div className="overflow-x-auto px-4">
      <table className="min-w-full bg-white border-collapse">
        <thead className="bg-black text-[#FEC00F]">
          <tr>
            <th className="py-2 px-4 border-b text-center">#</th>
            <th className="py-2 px-4 border-b text-center">Supplier Name</th>
            <th className="py-2 px-4 border-b text-center">Product</th>
            <th className="py-2 px-4 border-b text-center">Street Address</th>
            <th className="py-2 px-4 border-b text-center">City</th>
            <th className="py-2 px-4 border-b text-center">Contact No.</th>
            <th className="py-2 px-4 border-b text-center">Email</th>
            <th className="py-2 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier, index) => (
            <tr
              key={supplier.supplier_id}
              onClick={() => handleRowClick(supplier)}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
              } cursor-pointer hover:bg-gray-50`}
            >
              <td className="py-2 px-4 border-b text-center">
                {supplier.supplier_id}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {supplier.name}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {supplier.product}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {supplier.streetaddress}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {supplier.city}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {supplier.contactno}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {supplier.email}
              </td>
              <td className="py-2 px-4 border-b text-center">
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
                  onClick={(e) =>
                    handleDeleteClick(e, supplier.supplier_id, supplier.name)
                  }
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

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSupplierToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message={
          supplierToDelete
            ? `Are you sure you want to delete supplier "${supplierToDelete.name}"?`
            : ""
        }
      />
    </div>
  );
};

export default SupplierTable;
