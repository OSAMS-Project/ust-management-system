import React, { useState, useEffect } from "react";
import Button from "./Button";
import InputField from './InputField';
import SelectField from './SelectField';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import axios from 'axios';
import moment from 'moment';

// ... existing shake animation style code ...
const shakeStyle = `
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

const addShakeStyle = () => {
  const styleElement = document.createElement("style");
  styleElement.innerHTML = shakeStyle;
  document.head.appendChild(styleElement);
};

const AddAsset = ({
  onAddAsset,
  categories,
  locations,
  isModalOpen,
  onCloseModal,
  onOpenModal,
}) => {
  // ... Modal state variables ...
  const [assetName, setAssetName] = useState("");
  const [assetDetails, setAssetDetails] = useState("");
  const [cost, setCost] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [totalCost, setTotalCost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [createdDate, setCreatedDate] = useState(moment());
  const [image, setImage] = useState(null);
  const [type, setType] = useState("");
  const [shakeFields, setShakeFields] = useState([]);
  const [productCode, setProductCode] = useState("");

  // ... Modal useEffect and handler functions ...
  useEffect(() => {
    if (isModalOpen) {
      setAssetName("");
      setAssetDetails("");
      setCost("");
      setQuantity(1);
      setTotalCost("");
      setSelectedCategory("");
      setSelectedLocation("");
      setCreatedDate(moment());
      setImage(null);
      setType("");
      setProductCode("");
    }
  }, [isModalOpen]);

  useEffect(() => {
    addShakeStyle();
  }, []);

  // ... rest of the Modal handler functions ...
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const validateFields = () => {
    const newShakeFields = [];
    if (!assetName) newShakeFields.push("assetName");
    if (!assetDetails) newShakeFields.push("assetDetails");
    if (!selectedCategory) newShakeFields.push("selectedCategory");
    if (!selectedLocation) newShakeFields.push("selectedLocation");
    if (!cost) newShakeFields.push("cost");
    if (!quantity) newShakeFields.push("quantity");
    if (!type) newShakeFields.push("type");
    setShakeFields(newShakeFields);
    return newShakeFields.length === 0;
  };

  const calculateTotalCost = (newQuantity) => {
    if (cost && newQuantity) {
      const calculatedTotalCost = parseFloat(cost) * newQuantity;
      setTotalCost(calculatedTotalCost.toFixed(2));
    } else {
      setTotalCost("");
    }
  };

  const handleQuantityChange = (e) => {
    const newQuantity = Number(e.target.value);
    setQuantity(newQuantity);
    calculateTotalCost(newQuantity);
  };

  const handleCostChange = (e) => {
    const newCost = e.target.value.replace(/[^0-9.]/g, "");
    setCost(newCost);
    calculateTotalCost(quantity);
  };

  const handleSaveAsset = async () => {
    if (!validateFields()) {
      return;
    }

    const newAsset = {
      productCode: productCode || "N/A",
      assetName,
      assetDetails,
      quantity: parseInt(quantity),
      cost: parseFloat(cost),
      totalCost: parseFloat(totalCost),
      category: selectedCategory,
      location: selectedLocation,
      createdDate: createdDate.format('YYYY-MM-DD'),
      image,
      type
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/Assets/create`, newAsset);
      onAddAsset(response.data);
      onCloseModal();
    } catch (error) {
      console.error("Error creating asset:", error);
    }
  };

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
            {/* ... Modal content ... */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-8 py-5 border-b border-gray-300">
              <h2 className="text-2xl font-bold text-gray-800">Add Asset</h2>
            </div>
            
            {/* ... Form content ... */}
            <div className="px-8 py-6 max-h-[calc(100vh-150px)] overflow-y-auto">
              <form className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <InputField
                  label="Asset Name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  shake={shakeFields.includes("assetName")}
                />
                  <InputField
                  label="Product Code"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  shake={shakeFields.includes("productCode")}
                />
                <InputField
                  label="Asset Details"
                  value={assetDetails}
                  onChange={(e) => setAssetDetails(e.target.value)}
                  shake={shakeFields.includes("assetDetails")}
                />
                <SelectField
                  label="Asset Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={categories}
                  shake={shakeFields.includes("selectedCategory")}
                />
                <SelectField
                  label="Asset Location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  options={locations}
                  shake={shakeFields.includes("selectedLocation")}
                />
                <SelectField
                  label="Asset Type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  options={['Consumable', 'Non-Consumable']}
                  shake={shakeFields.includes("type")}
                />
                <InputField
                  label="Cost per Unit"
                  value={cost}
                  onChange={handleCostChange}
                  prefix="₱"
                  shake={shakeFields.includes("cost")}
                />
                <InputField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  shake={shakeFields.includes("quantity")}
                />
                <InputField
                  label="Total Cost"
                  value={totalCost}
                  prefix="₱"
                  readOnly
                />
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
                  {image && (
                    <div className="mt-3">
                      <img
                        src={image}
                        alt="Uploaded Asset"
                        className="h-24 w-24 object-cover rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* ... Modal footer ... */}
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
