import React from 'react';
import ReactDOM from 'react-dom';

const AddIncomingAssetForm = ({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  setShowForm, 
  categories,
  today,
  setNotification,
  resetFormData
}) => {
  // Get current date and time in Philippine timezone
  const getPhilippinesDateTime = () => {
    const now = new Date();
    const phDateTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    return phDateTime;
  };

  const formatDateTimeForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateTimeChange = (e) => {
    const selectedDateTime = new Date(e.target.value);
    const phNow = getPhilippinesDateTime();
    
    if (selectedDateTime < phNow) {
      setNotification({
        type: 'error',
        message: 'Cannot select a past date and time'
      });
      return;
    }
    
    handleInputChange(e);
  };

  const phNow = getPhilippinesDateTime();
  const minDateTime = formatDateTimeForInput(phNow);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto transform transition-all animate-fadeIn font-roboto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Add New Incoming Asset</h2>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset Name */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Asset Name</label>
                <input
                  type="text"
                  name="assetName"
                  value={formData.assetName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  placeholder="Enter asset name"
                />
              </div>

              {/* Type */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select type</option>
                  <option value="Consumable">Consumable</option>
                  <option value="Non-Consumable">Non-Consumable</option>
                </select>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Cost per Unit */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cost per Unit</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₱</span>
                  <input
                    type="text"
                    name="cost"
                    value={formData.cost}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleInputChange(e);
                      }
                    }}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="1"
                  required
                  placeholder="Enter quantity"
                />
              </div>

              {/* Total Cost */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Cost</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₱</span>
                  <input
                    type="number"
                    name="total_cost"
                    value={formData.total_cost}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              {/* Expected Date */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Date of Arrival</label>
                <input
                  type="datetime-local"
                  name="expected_date"
                  value={formData.expected_date}
                  min={minDateTime}
                  onChange={handleDateTimeChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter asset description"
                />
              </div>

              {/* Notes */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter additional notes"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetFormData();
                }}
                className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default AddIncomingAssetForm;
