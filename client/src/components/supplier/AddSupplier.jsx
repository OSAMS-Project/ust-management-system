import React, { useState } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';

const AddSupplier = ({ onSupplierAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    product: '',
    streetAddress: '',
    city: '',
    contactNo: '',
    email: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'contactNo') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prevState => ({
        ...prevState,
        [name]: numbersOnly
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/suppliers`, formData);
      onSupplierAdded(response.data);
      setIsModalOpen(false);
      setFormData({
        name: '',
        product: '',
        streetAddress: '',
        city: '',
        contactNo: '',
        email: ''
      });
    } catch (error) {
      console.error('Error adding supplier:', error);
      onSupplierAdded(null, new Error('Failed to add supplier. Please try again.'));
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
      >
        Add Supplier
      </button>

      {isModalOpen && ReactDOM.createPortal(
        <>,
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all animate-fadeIn">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-black">Add New Supplier</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number (Telephone or Cellphone)</label>
                    <input
                      type="tel"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleInputChange}
                      maxLength="11"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter telephone or cellphone number"
                      required
                    />
                    {formData.contactNo && !/^[0-9]+$/.test(formData.contactNo) && (
                      <p className="text-red-500 text-sm mt-1">
                        Please enter numbers only
                      </p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      For telephone: (02) XXXX-XXXX or for cellphone: 09XX-XXX-XXXX
                    </p>
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
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
                    >
                      Add Supplier
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default AddSupplier;
