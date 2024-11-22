import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Upload } from 'lucide-react';
import axios from 'axios';
import moment from 'moment';

// Utility function for input fields
const InputField = ({ label, id, type = "text", value, onChange, placeholder, prefix, readOnly, multiline, className, shake }) => (
  <div className={`space-y-1 ${shake ? 'animate-shake' : ''}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    {multiline ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        readOnly={readOnly}
      />
    ) : (
      <div className="relative">
        {prefix && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${prefix ? 'pl-7' : ''} ${className}`}
          readOnly={readOnly}
        />
      </div>
    )}
  </div>
);

// Utility function for select fields
const SelectField = ({ label, id, value, onChange, options, placeholder, shake }) => (
  <div className={`space-y-1 ${shake ? 'animate-shake' : ''}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={typeof option === 'string' ? option : option.value}>
          {typeof option === 'string' ? option : option.label}
        </option>
      ))}
    </select>
  </div>
);

const ToggleButton = ({ label, checked, onChange }) => (
  <div className="flex items-center space-x-3">
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-[#FEC000]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </div>
);

const AddAsset = ({ onAddAsset, categories, locations, isModalOpen, onCloseModal, onOpenModal }) => {
  const [formData, setFormData] = useState({
    assetName: "",
    assetDetails: "",
    cost: "",
    quantity: 1,
    totalCost: "",
    selectedCategory: "",
    selectedLocation: "",
    createdDate: moment(),
    image: null,
    type: "",
    productCode: "",
    allowBorrowing: false,
  });

  const [shakeFields, setShakeFields] = useState([]);

  useEffect(() => {
    if (isModalOpen) {
      setFormData({
        assetName: "",
        assetDetails: "",
        cost: "",
        quantity: 1,
        totalCost: "",
        selectedCategory: "",
        selectedLocation: "",
        createdDate: moment(),
        image: null,
        type: "",
        productCode: "",
        allowBorrowing: false,
      });
      setShakeFields([]);
    }
  }, [isModalOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'cost' || field === 'quantity') {
      const newCost = field === 'cost' ? value : formData.cost;
      const newQuantity = field === 'quantity' ? value : formData.quantity;
      if (newCost && newQuantity) {
        const calculatedTotalCost = parseFloat(newCost) * parseInt(newQuantity);
        setFormData(prev => ({
          ...prev,
          totalCost: calculatedTotalCost.toFixed(2)
        }));
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'assetName',
      'assetDetails',
      'selectedCategory',
      'selectedLocation',
      'cost',
      'quantity',
      'type'
    ];

    const emptyFields = requiredFields.filter(field => !formData[field]);
    setShakeFields(emptyFields);
    return emptyFields.length === 0;
  };

  const handleSaveAsset = async () => {
    if (!validateForm()) return;

    const newAsset = {
      productCode: formData.productCode || "N/A",
      assetName: formData.assetName,
      assetDetails: formData.assetDetails,
      quantity: parseInt(formData.quantity),
      cost: parseFloat(formData.cost),
      totalCost: parseFloat(formData.totalCost),
      category: formData.selectedCategory,
      location: formData.selectedLocation,
      createdDate: formData.createdDate.format('YYYY-MM-DD'),
      image: formData.image,
      type: formData.type,
      under_repair: false,
      allow_borrowing: formData.type === 'Consumable' ? formData.allowBorrowing : true,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/Assets/create`, 
        newAsset
      );
      onAddAsset(response.data);
      onCloseModal();
    } catch (error) {
      console.error("Error creating asset:", error);
    }
  };

  return (
    <>
      <button
        onClick={onOpenModal}
        className="px-4 py-2 border-2 border-black text-black bg-[#FEC000] rounded-lg hover:bg-[#ffda6a] duration-300 flex items-center gap-2"
      >
        <FontAwesomeIcon icon={faPlus} className="text-black" />
        <span>New Asset</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-2xl">
            <div className="bg-[#FEC000] px-8 py-5 rounded-t-[20px] border-b">
              <h2 className="text-2xl font-bold text-black">Add Asset</h2>
            </div>
            
            <div className="px-8 py-6 max-h-[calc(100vh-150px)] overflow-y-auto">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Asset Name"
                    id="assetName"
                    value={formData.assetName}
                    onChange={(e) => handleInputChange('assetName', e.target.value)}
                    placeholder="Enter asset name"
                    shake={shakeFields.includes("assetName")}
                  />
                  <InputField
                    label="Product Code"
                    id="productCode"
                    value={formData.productCode}
                    onChange={(e) => handleInputChange('productCode', e.target.value)}
                    placeholder="Enter product code"
                  />
                </div>

                <InputField
                  label="Asset Details"
                  id="assetDetails"
                  value={formData.assetDetails}
                  onChange={(e) => handleInputChange('assetDetails', e.target.value)}
                  placeholder="Enter asset details"
                  multiline
                  className="min-h-[100px]"
                  shake={shakeFields.includes("assetDetails")}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectField
                    label="Asset Category"
                    id="assetCategory"
                    value={formData.selectedCategory}
                    onChange={(e) => handleInputChange('selectedCategory', e.target.value)}
                    options={categories}
                    placeholder="Select Asset Category"
                    shake={shakeFields.includes("selectedCategory")}
                  />
                  <SelectField
                    label="Asset Type"
                    id="assetType"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    options={['Consumable', 'Non-Consumable']}
                    placeholder="Select Asset Type"
                    shake={shakeFields.includes("type")}
                  />
                </div>

                {formData.type === 'Consumable' && (
                  <div className="col-span-2">
                    <ToggleButton
                      label="Allow Borrowing for this Consumable Asset"
                      checked={formData.allowBorrowing}
                      onChange={(value) => handleInputChange('allowBorrowing', value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Cost per Unit"
                    id="cost"
                    value={formData.cost}
                    onChange={(e) => handleInputChange('cost', e.target.value.replace(/[^0-9.]/g, ""))}
                    prefix="₱"
                    shake={shakeFields.includes("cost")}
                  />
                  <InputField
                    label="Quantity"
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', Math.max(1, Number(e.target.value)))}
                    shake={shakeFields.includes("quantity")}
                    min="1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Total Cost"
                    id="totalCost"
                    value={formData.totalCost}
                    prefix="₱"
                    readOnly
                  />
                  <SelectField
                    label="Asset Location"
                    id="assetLocation"
                    value={formData.selectedLocation}
                    onChange={(e) => handleInputChange('selectedLocation', e.target.value)}
                    options={locations}
                    placeholder="Select Asset Location"
                    shake={shakeFields.includes("selectedLocation")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      onChange={handleImageUpload}
                      className="hidden"
                      id="assetImage"
                    />
                    <button
                      type="button"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                      onClick={() => document.getElementById('assetImage')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </button>
                  </div>
                  {formData.image && (
                    <div className="mt-3">
                      <img
                        src={formData.image}
                        alt="Uploaded Asset"
                        className="h-24 w-24 object-cover rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="px-8 py-5 border-t flex justify-end gap-4 rounded-b-[20px]">
              <button 
                onClick={onCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAsset}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#FEC000] hover:bg-[#ffd042] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddAsset;