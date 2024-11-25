import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';

const EditSupplier = ({ supplier, onSupplierUpdated, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    product: '',
    streetAddress: '',
    city: '',
    contactNo: '',
    email: ''
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        product: supplier.product,
        streetAddress: supplier.streetaddress,
        city: supplier.city,
        contactNo: supplier.contactno,
        email: supplier.email
      });
    }
  }, [supplier]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/suppliers/${supplier.supplier_id}`, 
        formData
      );
      
      await axios.post(`${process.env.REACT_APP_API_URL}/api/supplier-activity-logs`, {
        supplier_id: supplier.supplier_id,
        action: 'update',
        changes: {
          name: { oldValue: supplier.name, newValue: formData.name },
          product: { oldValue: supplier.product, newValue: formData.product },
          streetaddress: { oldValue: supplier.streetaddress, newValue: formData.streetAddress },
          city: { oldValue: supplier.city, newValue: formData.city },
          email: {oldValue: supplier.email, newValue: formData.email},
          contactno: { oldValue: supplier.contactno, newValue: formData.contactNo }
        }
      });

      onSupplierUpdated(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating supplier:', error);
      onSupplierUpdated(null, new Error('Failed to update supplier. Please try again.'));
    }
  };

  return ReactDOM.createPortal(
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      
      {/* Modal content */}
      <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-black">Edit Supplier</h3>
              <button
                onClick={onClose}
                className="text-black hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product</label>
                <input
                  type="text"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact No</label>
                <input
                  type="text"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
                >
                  Update Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default EditSupplier;
