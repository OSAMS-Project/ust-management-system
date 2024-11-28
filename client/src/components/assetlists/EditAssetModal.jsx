import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';
import moment from 'moment';

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

const SelectField = ({ label, id, value, onChange, options, placeholder, shake, error }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={id}>
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
        shake ? 'animate-shake' : ''
      } ${error ? 'border-red-500' : ''}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
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

const EditAssetModal = ({ isOpen, onClose, asset, categories = [], locations = [], onEditAsset }) => {
  const [editedAsset, setEditedAsset] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [totalCost, setTotalCost] = useState("");
  const [quantityForBorrowing, setQuantityForBorrowing] = useState(0);
  const [shakeFields, setShakeFields] = useState([]);
  const [typeChangeError, setTypeChangeError] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (asset) {
      setEditedAsset({
        ...asset,
        allow_borrowing: asset.allow_borrowing || false,
      });
      setNewImage(null);
      // Calculate total cost based on total quantity
      const totalQuantity = parseInt(asset.quantity) + parseInt(asset.quantity_for_borrowing || 0);
      const totalCostValue = parseFloat(asset.cost) * totalQuantity;
      setTotalCost(totalCostValue.toFixed(2));
      setQuantityForBorrowing(asset.quantity_for_borrowing);
      setShakeFields([]);
    }
  }, [asset]);

  const handleChange = async (field, value) => {
    if (field === 'type' && value === 'Consumable' && editedAsset.type === 'Non-Consumable') {
      const status = await checkAssetStatus(editedAsset.asset_id);
      if (!status.canChangeType) {
        setTypeChangeError(status.message);
        return;
      }
      setTypeChangeError('');
    }

    setEditedAsset(prev => {
      const newAsset = {
        ...prev,
        [field]: value
      };

      // Recalculate total cost when quantity or cost changes
      if (field === 'quantity' || field === 'cost') {
        const newQuantity = field === 'quantity' ? value : newAsset.quantity;
        const newCost = field === 'cost' ? value : newAsset.cost;
        // Include quantity_for_borrowing in total cost calculation
        const totalQuantity = parseInt(newQuantity) + parseInt(prev.quantity_for_borrowing || 0);
        const newTotalCost = parseFloat(newCost) * totalQuantity;
        newAsset.totalCost = newTotalCost;
        setTotalCost(newTotalCost.toFixed(2));
      }

      return newAsset;
    });
  };

  const calculateTotalCost = (quantity, cost) => {
    if (quantity && cost) {
      // Include quantity_for_borrowing in total cost calculation
      const totalQuantity = parseInt(quantity) + parseInt(editedAsset?.quantity_for_borrowing || 0);
      const calculatedTotalCost = parseFloat(cost) * totalQuantity;
      setTotalCost(calculatedTotalCost.toFixed(2));
    } else {
      setTotalCost("0.00");
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
        // Check for duplicate product code
        if (editedAsset.productCode !== asset.productCode && 
            editedAsset.productCode && 
            editedAsset.productCode !== 'N/A') {
          const checkResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/assets/check-product-code/${encodeURIComponent(editedAsset.productCode)}`
          );
          if (checkResponse.data.exists) {
            setNotification({
              type: 'error',
              message: 'An asset with this product code already exists'
            });
            return;
          }
        }

        // Check for duplicate serial number
        if (editedAsset.serialNumber !== asset.serialNumber && 
            editedAsset.serialNumber && 
            editedAsset.serialNumber !== 'N/A') {
          const checkSerialResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/assets/check-serial-number/${encodeURIComponent(editedAsset.serialNumber)}`
          );
          if (checkSerialResponse.data.exists) {
            setNotification({
              type: 'error',
              message: 'An asset with this serial number already exists'
            });
            return;
          }
        }

        // Check if type is being changed from Non-Consumable to Consumable
        if (asset.type === 'Non-Consumable' && editedAsset.type === 'Consumable') {
          const status = await checkAssetStatus(editedAsset.asset_id);
          if (!status.canChangeType) {
            setTypeChangeError(status.message);
            return; // Prevent saving if there are active records
          }
        }

        const updatedAsset = {
          ...editedAsset,
          image: newImage || editedAsset.image,
          totalCost: editedAsset.totalCost,
          quantity: editedAsset.quantity,
          quantity_for_borrowing: editedAsset.is_active ? parseInt(quantityForBorrowing, 10) : 0,
          cost: editedAsset.cost,
          lastUpdated: moment().format('YYYY-MM-DD HH:mm:ss')
        };

        // Log only the changed fields
        const changedFields = Object.keys(updatedAsset).reduce((acc, key) => {
          if (key === 'quantity_for_borrowing' && !editedAsset.is_active) {
            return acc; // Skip logging quantity_for_borrowing if the asset is not active
          }
          // Don't include totalCost in the changed fields if only quantity_for_borrowing was changed
          if (key === 'totalCost' && Object.keys(acc).length === 1 && acc.hasOwnProperty('quantity_for_borrowing')) {
            return acc;
          }
          if (key === 'totalCost') {
            // Only include totalCost if it has actually changed
            const oldTotalCost = parseFloat((asset.cost * asset.quantity).toFixed(2));
            const newTotalCost = parseFloat(updatedAsset.totalCost);
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
          const user = JSON.parse(localStorage.getItem('user'));

          const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/assets/update/${updatedAsset.asset_id}`, updatedAsset);
          console.log("Update response:", response.data);

          // Send changed fields to the backend
          await axios.post(`${process.env.REACT_APP_API_URL}/api/asset-activity-logs`, {
            asset_id: updatedAsset.asset_id,
            action: 'update',
            changes: changedFields,
            modified_by: user?.name || user?.email,
            user_picture: user?.picture
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

  const handleQuantityForBorrowingChange = async (value) => {
    const newValue = Number(value);
    
    if (isNaN(newValue) || newValue < 0) {
      return;
    }

    // Calculate the difference between new and current borrowing quantity
    const quantityDifference = newValue - quantityForBorrowing;
    
    // Check if we have enough main quantity available when increasing
    if (quantityDifference > 0) {
      const availableMainQuantity = editedAsset.quantity;
      if (availableMainQuantity - quantityDifference < 0) {
        setNotification({
          type: 'error',
          message: `Cannot allocate more than available quantity. This would result in negative main quantity.`
        });
        return;
      }
    }

    if (newValue < quantityForBorrowing) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/borrowing-requests/pending/${asset.asset_id}`
        );
        const pendingTotal = response.data.total_requested;

        if (newValue < pendingTotal) {
          setNotification({
            type: 'error',
            message: `Cannot decrease borrowing quantity below pending requests (${pendingTotal} units currently requested)`
          });
          return;
        }
      } catch (error) {
        console.error('Error checking pending requests:', error);
        setNotification({
          type: 'error',
          message: 'Error validating quantity change'
        });
        return;
      }
    }

    // Calculate new main quantity by subtracting the difference from current quantity
    const newMainQuantity = editedAsset.quantity - quantityDifference;

    // Calculate total cost based on total quantity (main + borrowing)
    const totalQuantity = newMainQuantity + newValue;
    const newTotalCost = parseFloat(editedAsset.cost) * totalQuantity;

    setQuantityForBorrowing(newValue);
    setTotalCost(newTotalCost.toFixed(2));
    setEditedAsset(prev => ({
      ...prev,
      quantity: newMainQuantity,
      quantity_for_borrowing: newValue,
      totalCost: newTotalCost
    }));
  };

  const handleTypeChange = async (value) => {
    // Only check if we're actually changing the type
    if (value !== editedAsset.type && value === 'Consumable' && asset.quantity_for_borrowing > 0) {
      setNotification({
        type: 'error',
        message: 'Cannot change to Consumable while asset has borrowing quantity. Please deactivate borrowing first.'
      });
      return;
    }
    
    setEditedAsset(prev => ({
      ...prev,
      type: value
    }));
  };

  const checkAssetStatus = async (assetId) => {
    try {
      // Check repair records
      const repairResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/repair/read`);
      const hasActiveRepairs = repairResponse.data.some(
        record => record.asset_id === assetId && record.status !== 'Completed'
      );

      // Check issue records
      const issueResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/asset-issues`);
      const hasActiveIssues = issueResponse.data.some(
        issue => issue.asset_id === assetId && 
        issue.status !== 'Resolved' && 
        issue.status !== 'In Repair'
      );

      // Check borrowing requests
      const borrowResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/borrowing-requests`);
      const hasActiveBorrowRequests = borrowResponse.data.some(
        request => request.selected_assets.some(
          selectedAsset => selectedAsset.asset_id === assetId
        ) && request.status === 'Pending'
      );

      return {
        canChangeType: !hasActiveRepairs && !hasActiveIssues && !hasActiveBorrowRequests,
        message: hasActiveRepairs ? 'Cannot change to Consumable: Asset has active repair records' :
                hasActiveIssues ? 'Cannot change to Consumable: Asset has active issue records' :
                hasActiveBorrowRequests ? 'Cannot change to Consumable: Asset has pending borrow requests' : ''
      };
    } catch (error) {
      console.error('Error checking asset status:', error);
      return {
        canChangeType: false,
        message: 'Error checking asset status'
      };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${
          notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {notification.message}
        </div>
      )}
      
      <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-2xl">
        <div className="bg-[#FEC000] px-8 py-5 rounded-t-[20px] border-b">
          <h2 className="text-2xl font-bold text-black">Edit Asset</h2>
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
                  type="text"
                  value={editedAsset.productCode}
                  onChange={(e) => handleChange('productCode', e.target.value.replace(/[^0-9\s]/g, ''))}
                  placeholder="Enter product code (numbers and spaces only)"
                />
                <InputField
                  label="Serial Number"
                  id="serialNumber"
                  type="text"
                  value={editedAsset.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  placeholder="Enter serial number"
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
                  onChange={(e) => handleTypeChange(e.target.value)}
                  options={['Consumable', 'Non-Consumable']}
                  placeholder="Select Asset Type"
                  shake={shakeFields.includes('type')}
                  error={typeChangeError}
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
                  onChange={(e) => handleChange('quantity', Math.max(1, Number(e.target.value)))}
                  shake={shakeFields.includes('quantity')}
                  min="1"
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
                  onChange={(e) => handleQuantityForBorrowingChange(Math.max(1, Number(e.target.value)))}
                  min="1"
                />
              )}

              {editedAsset.type === 'Consumable' && (
                <div className="col-span-2">
                  <ToggleButton
                    label="Allow Borrowing for this Consumable Asset"
                    checked={editedAsset.allow_borrowing}
                    onChange={(value) => handleChange('allow_borrowing', value)}
                  />
                </div>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

        <div className="px-8 py-5 border-t flex justify-end gap-4 rounded-b-[20px]">
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