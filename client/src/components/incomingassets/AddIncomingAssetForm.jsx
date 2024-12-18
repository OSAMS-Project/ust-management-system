import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

const AddIncomingAssetForm = ({
  formData,
  handleInputChange,
  setShowForm,
  categories,
  setNotification,
  resetFormData,
}) => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [showNewSupplierInput, setShowNewSupplierInput] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Get current date and time in Philippine timezone
  const getPhilippinesDateTime = () => {
    const now = new Date();
    const phDateTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
    );
    return phDateTime;
  };

  const formatDateTimeForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateTimeChange = (e) => {
    const selectedDateTime = new Date(e.target.value);
    const phNow = getPhilippinesDateTime();

    if (selectedDateTime < phNow) {
      setNotification({
        type: "error",
        message: "Cannot select a past date and time",
      });
      return;
    }

    handleInputChange(e);
  };

  const phNow = getPhilippinesDateTime();
  const minDateTime = formatDateTimeForInput(phNow);

 // Fetch existing assets and suppliers
 useEffect(() => {
  const fetchAssets = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/assets/read`
      );
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setNotification({
        type: "error",
        message: "Failed to fetch existing assets.",
      });
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/suppliers`
      );
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setNotification({
        type: "error",
        message: "Failed to fetch suppliers.",
      });
    }
  };

  fetchAssets();
  fetchSuppliers();
}, [setNotification]);
  

  const handleAssetChange = (e) => {
    const value = e.target.value;
    handleInputChange(e);

    if (value) {
      const filtered = assets.filter((asset) =>
        asset.assetName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAssets(filtered);
      setShowDropdown(true);
    } else {
      setFilteredAssets([]);
      setShowDropdown(false);
    }
  };

  

  const handleSupplierChange = (e) => {
    const value = e.target.value;
    handleInputChange({ target: { name: "supplier", value } });
    setShowNewSupplierInput(value === "add-new");
  };


  const selectAsset = (asset) => {
    setSelectedAsset(asset);
    handleInputChange({
      target: { name: "assetName", value: asset.assetName },
    });
    handleInputChange({
      target: { name: "category", value: asset.category },
    });
    handleInputChange({
      target: { name: "type", value: asset.type },
    });
    handleInputChange({
      target: { name: "cost", value: asset.cost },
    });

    setNotification({
      type: "info",
      message: `Selected existing asset: ${asset.assetName}. Any quantity entered will be added to the existing quantity.`,
    });

    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Log the form data before submission
      console.log("Submitting form data:", formData);

      // Validate required fields
      const requiredFields = ['assetName', 'description', 'quantity', 'cost'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        setNotification({
          type: "error",
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
        return;
      }

      // Format the data
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        cost: parseFloat(formData.cost),
        total_cost: parseFloat(formData.total_cost || 0),
        status: "pending"
      };

      // Make the API call
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/incoming-assets`,
        submitData
      );

      if (response.status === 201) {
        setNotification({
          type: "success",
          message: "Asset added successfully"
        });
        resetFormData();
        setShowForm(false);
      }

    } catch (error) {
      console.error("Error submitting asset:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Error creating incoming asset"
      });
    }
  };
  
  
  console.log("Form Data:", formData);
  

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target) &&
      inputRef.current !== event.target
    ) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto transform transition-all animate-fadeIn font-roboto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-black">Add New Incoming Asset</h2>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset Name */}
              <div className="form-group relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Asset Name
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  name="assetName"
                  value={formData.assetName || ""}
                  onChange={handleAssetChange}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter or select an asset name"
                  required
                />
                {showDropdown && filteredAssets.length > 0 && (
                  <ul
                    ref={dropdownRef}
                    className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-32 overflow-y-auto rounded-lg shadow-lg"
                  >
                    {filteredAssets.map((asset) => (
                      <li
                        key={asset.asset_id}
                        onClick={() => selectAsset(asset)}
                        className="px-4 py-2 cursor-pointer hover:bg-yellow-100"
                      >
                        {asset.assetName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Type */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              

              {/* Cost per Unit */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cost per Unit
                </label>
                <input
                  type="text"
                  name="cost"
                  value={formData.cost || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      handleInputChange(e);
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter cost"
                  required
                />
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="1"
                  placeholder="Enter quantity"
                  required
                />
              </div>

  {/* Existing Quantity */}
  {selectedAsset && (
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Existing Quantity
                  </label>
                  <p className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800">
                    {selectedAsset.quantity || 0}
                  </p>
                </div>
              )}

              {/* Supplier */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Supplier
                </label>
                <select
                  name="supplier"
                  value={formData.supplier || ""}
                  onChange={handleSupplierChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.supplier_id} value={supplier.name}>
                      {supplier.name}
                    </option>
                  ))}
                  <option value="add-new">Add New Supplier</option>
                </select>
              </div>

              {showNewSupplierInput && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Supplier Name
                  </label>
                  <input
                    type="text"
                    name="new_supplier"
                    value={formData.new_supplier || ""}
                    onChange={(e) =>
                      handleInputChange({
                        target: { name: "new_supplier", value: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter new supplier name"
                  />
                </div>
              )}

              {/* Total Cost */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Cost
                </label>
                <input
                  type="text"
                  name="total_cost"
                  value={formData.total_cost || ""}
                  readOnly
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 cursor-not-allowed"
                />
              </div>

              {/* Expected Date */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expected Date of Arrival
                </label>
                <input
                  type="datetime-local"
                  name="expected_date"
                  value={formData.expected_date || ""}
                  min={minDateTime}
                  onChange={handleDateTimeChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter description"
                />
              </div>

              {/* Notes */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter notes"
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
    document.getElementById("modal-root")
  );
};

export default AddIncomingAssetForm;
