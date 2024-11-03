import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SupplierInfoCard from '../components/supplier/supplierinfocard';
import SupplierTable from '../components/supplier/suppliertable';
import AddSupplier from '../components/supplier/addsupplier';
import EditSupplier from '../components/supplier/editsupplier';
import SupplierSearch from '../components/supplier/suppliersearch';
import NotificationPopup from '../components/utils/NotificationsPopup';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [supplierToEdit, setSupplierToEdit] = useState(null);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/suppliers`);
      setSuppliers(response.data);
      setTotalSuppliers(response.data.length);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSupplierAdded = (newSupplier) => {
    setSuppliers([...suppliers, newSupplier]);
    setNotification({
      type: 'success',
      message: 'Supplier added successfully!'
    });
  };

  const handleDelete = async (supplier_id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/suppliers/${supplier_id}`);
      setSuppliers(suppliers.filter(supplier => supplier.supplier_id !== supplier_id));
      setNotification({
        type: 'success',
        message: 'Supplier deleted successfully!'
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete supplier. Please try again.'
      });
    }
  };

  const handleEdit = (supplier) => {
    setSupplierToEdit(supplier);
    setIsEditModalOpen(true);
  };

  const handleSupplierUpdated = (updatedSupplier) => {
    setSuppliers(suppliers.map(supplier => 
      supplier.supplier_id === updatedSupplier.supplier_id ? updatedSupplier : supplier
    ));
    setSupplierToEdit(null);
    setIsEditModalOpen(false);
    setNotification({
      type: 'success',
      message: 'Supplier updated successfully!'
    });
  };

  const handleSearch = (searchTerm) => {
    const filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  };

  return (
    <div className="p-4">
      <SupplierInfoCard totalSuppliers={totalSuppliers} />
      <div className="flex justify-between items-center mb-4">
        <SupplierSearch handleSearch={handleSearch} />
        <AddSupplier 
          onSupplierAdded={handleSupplierAdded} 
          onSupplierUpdated={handleSupplierUpdated}
          supplierToEdit={supplierToEdit}
        />
      </div>
      <SupplierTable 
        suppliers={filteredSuppliers.length > 0 ? filteredSuppliers : suppliers} 
        onDelete={handleDelete} 
        onEdit={handleEdit} 
      />
      {isEditModalOpen && (
        <EditSupplier
          supplier={supplierToEdit}
          onSupplierUpdated={handleSupplierUpdated}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
      <NotificationPopup 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />
    </div>
  );
};

export default SupplierList;
