import React, { useState, useEffect } from "react";
import axios from "axios";
import SupplierTable from "../components/supplier/SupplierTable";
import AddSupplier from "../components/supplier/AddSupplier";
import EditSupplier from "../components/supplier/EditSupplier";
import SupplierSearch from "../components/supplier/SupplierSearch";
import NotificationPopup from "../components/utils/NotificationsPopup";
import PaginationControls from "../components/assetlists/PaginationControls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [supplierToEdit, setSupplierToEdit] = useState(null);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/suppliers`
      );
      setSuppliers(response.data);
      setTotalSuppliers(response.data.length);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleSupplierAdded = (newSupplier) => {
    const updatedSuppliers = [...suppliers, newSupplier];
    updateSuppliers(updatedSuppliers);
    setNotification({
      type: "success",
      message: "Supplier added successfully!",
    });
    setIsAddSupplierModalOpen(false);
  };

  const handleDelete = async (supplier_id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/suppliers/${supplier_id}`
      );
      const updatedSuppliers = suppliers.filter(
        (supplier) => supplier.supplier_id !== supplier_id
      );
      updateSuppliers(updatedSuppliers);
      setNotification({
        type: "success",
        message: "Supplier deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      setNotification({
        type: "error",
        message: "Failed to delete supplier. Please try again.",
      });
    }
  };

  const handleEdit = (supplier) => {
    setSupplierToEdit(supplier);
    setIsEditModalOpen(true);
  };

  const handleSupplierUpdated = (updatedSupplier) => {
    setSuppliers(
      suppliers.map((supplier) =>
        supplier.supplier_id === updatedSupplier.supplier_id
          ? updatedSupplier
          : supplier
      )
    );
    setSupplierToEdit(null);
    setIsEditModalOpen(false);
    setNotification({
      type: "success",
      message: "Supplier updated successfully!",
    });
  };

  const updateSuppliers = (updatedSuppliers) => {
    setSuppliers(updatedSuppliers);
    setTotalSuppliers(updatedSuppliers.length);
  };

  const handleSearch = (searchTerm) => {
    const filtered = suppliers.filter((supplier) =>
      supplier.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const calculateStartIndex = () => {
    return (currentPage - 1) * itemsPerPage + 1;
  };

  const calculateEndIndex = () => {
    const endIndex = currentPage * itemsPerPage;
    const currentSuppliers =
      filteredSuppliers.length > 0 ? filteredSuppliers : suppliers;
    return endIndex > currentSuppliers.length
      ? currentSuppliers.length
      : endIndex;
  };

  const totalPages = Math.ceil(
    (filteredSuppliers.length > 0
      ? filteredSuppliers.length
      : suppliers.length) / itemsPerPage
  );

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            currentPage === i
              ? "bg-[#FEC00F] text-black focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  // Get current suppliers
  const getCurrentSuppliers = () => {
    const currentSuppliers =
      filteredSuppliers.length > 0 ? filteredSuppliers : suppliers;
    const indexOfLastSupplier = currentPage * itemsPerPage;
    const indexOfFirstSupplier = indexOfLastSupplier - itemsPerPage;
    return currentSuppliers.slice(indexOfFirstSupplier, indexOfLastSupplier);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">
          Supplier Directory
        </h1>
        <FontAwesomeIcon
          icon={faUsers}
          className="text-black text-5xl transform"
        />
      </div>

      {/* Supplier Summary Card - Only display if the Add Supplier modal is not open */}
      {!isAddSupplierModalOpen && (
        <div className="px-4">
          <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full px-5 py-1 text-center uppercase tracking-wider mb-3">
            Supplier Summary
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            <div
              className="bg-yellow-400 p-6 rounded-lg shadow-md flex items-center justify-center h-48 bg-cover bg-center relative overflow-hidden"
              style={{ backgroundImage: "url('ust-img-4.JPG')" }}
            >
              <div className="absolute inset-0 bg-black opacity-50"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <h2 className="text-7xl font-bold text-yellow-400">
                  {totalSuppliers}
                </h2>
                <p className="text-2xl font-semibold text-white mt-2">
                  Total Suppliers
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Add Supplier Section */}
      <div className="flex justify-between items-center mb-4 px-4">
        <SupplierSearch handleSearch={handleSearch} />
        <AddSupplier
          onSupplierAdded={handleSupplierAdded}
          onSupplierUpdated={handleSupplierUpdated}
          supplierToEdit={supplierToEdit}
          setIsModalOpen={setIsAddSupplierModalOpen} // Pass down to control the modal state
        />
      </div>

      {/* Supplier Table with Pagination */}
      <div className="px-4">
        <SupplierTable
          suppliers={getCurrentSuppliers()}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        {/* Add Pagination Controls */}
        {(suppliers.length > 0 || filteredSuppliers.length > 0) && (
          <PaginationControls
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            calculateStartIndex={calculateStartIndex}
            calculateEndIndex={calculateEndIndex}
            totalItems={
              filteredSuppliers.length > 0
                ? filteredSuppliers.length
                : suppliers.length
            }
            renderPageNumbers={renderPageNumbers}
          />
        )}
      </div>

      {/* Edit Supplier Modal */}
      {isEditModalOpen && (
        <EditSupplier
          supplier={supplierToEdit}
          onSupplierUpdated={handleSupplierUpdated}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Notification Popup */}
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default SupplierList;
