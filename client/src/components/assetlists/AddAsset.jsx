import React, { useState, useEffect } from "react";
import Button from "./Button";
import InputField from './InputField';
import SelectField from './SelectField';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import moment from 'moment';

// Styles
const shakeAnimation = `
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
  }

  .shake {
    animation: shake 0.5s;
  }
`;

// Initial form state
const initialFormState = {
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
};

const AddAsset = ({
  onAddAsset,
  categories,
  locations,
  isModalOpen,
  onCloseModal,
  onOpenModal,
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [shakeFields, setShakeFields] = useState([]);

  // Add shake animation style on component mount
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = shakeAnimation;
    document.head.appendChild(styleElement);
    return () => styleElement.remove();
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setFormData(initialFormState);
      setShakeFields([]);
    }
  }, [isModalOpen]);

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update total cost if cost or quantity changes
    if (field === 'cost' || field === 'quantity') {
      const newCost = field === 'cost' ? value : formData.cost;
      const newQuantity = field === 'quantity' ? value : formData.quantity;
      if (newCost && newQuantity) {
        const calculatedTotalCost = parseFloat(newCost) * parseInt(newQuantity);
        setFormData(prev => ({
          ...prev,
          totalCost: calculatedTotalCost.toString()
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
      under_maintenance: false // Add default maintenance status
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

  // Render form fields
  const renderFormFields = () => (
    <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <InputField
        label="Asset Name"
        value={formData.assetName}
        onChange={(e) => handleInputChange('assetName', e.target.value)}
        shake={shakeFields.includes("assetName")}
      />
      <InputField
        label="Product Code"
        value={formData.productCode}
        onChange={(e) => handleInputChange('productCode', e.target.value)}
      />
      <InputField
        label="Asset Details"
        value={formData.assetDetails}
        onChange={(e) => handleInputChange('assetDetails', e.target.value)}
        shake={shakeFields.includes("assetDetails")}
      />
      <SelectField
        label="Asset Category"
        value={formData.selectedCategory}
        onChange={(e) => handleInputChange('selectedCategory', e.target.value)}
        options={categories}
        shake={shakeFields.includes("selectedCategory")}
      />
      <SelectField
        label="Asset Location"
        value={formData.selectedLocation}
        onChange={(e) => handleInputChange('selectedLocation', e.target.value)}
        options={locations}
        shake={shakeFields.includes("selectedLocation")}
      />
      <SelectField
        label="Asset Type"
        value={formData.type}
        onChange={(e) => handleInputChange('type', e.target.value)}
        options={['Consumable', 'Non-Consumable']}
        shake={shakeFields.includes("type")}
      />
      <InputField
        label="Cost per Unit"
        value={formData.cost}
        onChange={(e) => handleInputChange('cost', e.target.value.replace(/[^0-9.]/g, ""))}
        prefix="₱"
        shake={shakeFields.includes("cost")}
      />
      <InputField
        label="Quantity"
        type="number"
        value={formData.quantity}
        onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
        shake={shakeFields.includes("quantity")}
      />
      <InputField
        label="Total Cost"
        value={formData.totalCost}
        prefix="₱"
        readOnly
      />
      {/* Image upload field */}
      <div className="col-span-2 space-y-3">
        <label className="block text-sm font-medium text-gray-700">Upload Image</label>
        <input 
          type="file" 
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-600
            file:mr-4 file:py-3 file:px-5
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
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
  );

  return (
    <>
      <Button
        onClick={onOpenModal}
        className="px-3 py-2 border border-[#FEC00F] text-black bg-[#FEC000] rounded-md hover:bg-[#ffda6a] duration-300"
      >
        <FontAwesomeIcon icon={faPlus} className="text-black" />
        <span className="text-black"> New Asset</span>
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-8 py-5 border-b border-gray-300">
              <h2 className="text-2xl font-bold text-gray-800">Add Asset</h2>
            </div>
            
            <div className="px-8 py-6 max-h-[calc(100vh-150px)] overflow-y-auto">
              {renderFormFields()}
            </div>

            <div className="bg-gray-100 px-8 py-5 border-t border-gray-300 flex justify-end gap-4">
              <Button 
                onClick={onCloseModal}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAsset}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Asset
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddAsset;
