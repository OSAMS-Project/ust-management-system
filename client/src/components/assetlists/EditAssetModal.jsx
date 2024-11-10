import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';

// Copy the same utility components from AddAsset.jsx
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

const EditAssetModal = ({ isOpen, onClose, asset, categories = [], locations = [], onEditAsset }) => {
  const [editedAsset, setEditedAsset] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [totalCost, setTotalCost] = useState("");
  const [quantityForBorrowing, setQuantityForBorrowing] = useState(0);
  const [shakeFields, setShakeFields] = useState([]);

  useEffect(() => {
    if (asset) {
      setEditedAsset(asset);
      setNewImage(null);
      calculateTotalCost(asset.quantity, asset.cost);
      setQuantityForBorrowing(asset.quantity_for_borrowing);
      setShakeFields([]);
    }
  }, [asset]);

  const handleChange = (field, value) => {
    setEditedAsset(prev => ({ ...prev, [field]: value }));
    if (field === 'quantity' || field === 'cost') {
      calculateTotalCost(
        field === 'quantity' ? value : editedAsset.quantity,
        field === 'cost' ? value : editedAsset.cost
      );
    }
  };

  const calculateTotalCost = (quantity, cost) => {
    if (quantity && cost) {
      const calculatedTotalCost = parseFloat(cost) * parseInt(quantity);
      setTotalCost(calculatedTotalCost.toFixed(2));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'assetName',
      'assetDetails',
      'category',
      'location',
      'cost',
      'quantity',
      'type'
    ];

    const emptyFields = requiredFields.filter(field => !editedAsset?.[field]);
    setShakeFields(emptyFields);
    return emptyFields.length === 0;
  };

  const handleSaveAsset = async () => {
    if (!validateForm()) return;
    
    if (editedAsset) {
      try {
        if (quantityForBorrowing > editedAsset.quantity) {
          alert(`Quantity for borrowing cannot exceed available quantity of ${editedAsset.quantity}.`);
          setQuantityForBorrowing(editedAsset.quantity);
          return;
        }
        const updatedAsset = {
          ...editedAsset,
          image: newImage || editedAsset.image,
          totalCost: parseFloat(totalCost),
          quantityForBorrowing: editedAsset.is_active ? parseInt(quantityForBorrowing, 10) : 0
        };
        delete updatedAsset.lastUpdated;

        // Log only the changed fields
        const changedFields = Object.keys(updatedAsset).reduce((acc, key) => {
          if (key === 'quantityForBorrowing' && !editedAsset.is_active) {
            return acc; // Skip logging quantityForBorrowing if the asset is not active
          }
          if (key === 'totalCost') {
            // Only include totalCost if it has actually changed
            const oldTotalCost = parseFloat((asset.cost * asset.quantity).toFixed(2));
            const newTotalCost = parseFloat(updatedAsset.totalCost.toFixed(2));
            if (oldTotalCost !== newTotalCost) {
              acc[key] = {
                oldValue: oldTotalCost,
                newValue: newTotalCost
              };
            }
          } else if (JSON.stringify(updatedAsset[key]) !== JSON.stringify(asset[key])) {
            acc[key] = {
              oldValue: asset[key],
              newValue: updatedAsset[key]
            };
          }
          return acc;
        }, {});

        if (Object.keys(changedFields).length > 0) {
          const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/assets/update/${updatedAsset.asset_id}`, updatedAsset);
          console.log("Update response:", response.data);

          // Send changed fields to the backend
          await axios.post(`${process.env.REACT_APP_API_URL}/api/asset-activity-logs`, {
            asset_id: updatedAsset.asset_id,
            action: 'update',
            changes: changedFields
          });

          onEditAsset(response.data);
        }
        onClose();
      } catch (error) {
        console.error("Error updating asset:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="px-8 py-5 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Edit Asset</h2>
        </div>
        
        <div className="px-8 py-6 max-h-[calc(100vh-150px)] overflow-y-auto">
          {editedAsset && (
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Asset Name"
                  id="assetName"
                  value={editedAsset.assetName}
                  onChange={(e) => handleChange('assetName', e.target.value)}
                  placeholder="Enter asset name"
                  shake={shakeFields.includes('assetName')}
                />
                <InputField
                  label="Product Code"
                  id="productCode"
                  value={editedAsset.productCode}
                  onChange={(e) => handleChange('productCode', e.target.value)}
                  placeholder="Enter product code"
                />
              </div>

              <InputField
                label="Asset Details"
                id="assetDetails"
                value={editedAsset.assetDetails}
                onChange={(e) => handleChange('assetDetails', e.target.value)}
                placeholder="Enter asset details"
                multiline
                className="min-h-[100px]"
                shake={shakeFields.includes('assetDetails')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Asset Category"
                  id="category"
                  value={editedAsset.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  options={categories}
                  placeholder="Select Asset Category"
                  shake={shakeFields.includes('category')}
                />
                <SelectField
                  label="Asset Type"
                  id="type"
                  value={editedAsset.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  options={['Consumable', 'Non-Consumable']}
                  placeholder="Select Asset Type"
                  shake={shakeFields.includes('type')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Cost per Unit"
                  id="cost"
                  value={editedAsset.cost}
                  onChange={(e) => handleChange('cost', e.target.value.replace(/[^0-9.]/g, ""))}
                  prefix="₱"
                  shake={shakeFields.includes('cost')}
                />
                <InputField
                  label="Quantity"
                  id="quantity"
                  type="number"
                  value={editedAsset.quantity}
                  onChange={(e) => handleChange('quantity', Number(e.target.value))}
                  shake={shakeFields.includes('quantity')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Total Cost"
                  id="totalCost"
                  value={totalCost}
                  prefix="₱"
                  readOnly
                />
                <SelectField
                  label="Asset Location"
                  id="location"
                  value={editedAsset.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  options={locations}
                  placeholder="Select Asset Location"
                  shake={shakeFields.includes('location')}
                />
              </div>

              {editedAsset.is_active && (
                <InputField
                  label="Quantity for Borrowing"
                  id="quantityForBorrowing"
                  type="number"
                  value={quantityForBorrowing}
                  onChange={(e) => setQuantityForBorrowing(Number(e.target.value))}
                  min="1"
                />
              )}

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
                {(newImage || editedAsset.image) && (
                  <div className="mt-3">
                    <img
                      src={newImage || editedAsset.image}
                      alt="Asset"
                      className="h-24 w-24 object-cover rounded-md border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="px-8 py-5 border-t flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveAsset}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAssetModal;