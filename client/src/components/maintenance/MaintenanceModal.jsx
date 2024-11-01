import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MaintenanceModal = ({ isOpen, onClose, onAddMaintenance }) => {
  const [assets, setAssets] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState({
    assetId: '',
    maintenanceType: '',
    description: '',
    date: '',
    cost: '',
    performedBy: '',
  });

  const maintenanceTypes = [
    'Preventive Maintenance',
    'Corrective Maintenance',
    'Predictive Maintenance',
    'Condition-based Maintenance',
    'Routine Inspection',
    'Emergency Repair',
    'Hardware Upgrade',
    'Calibration',
    'Cleaning',
  ];

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen]);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Assets/read`);
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMaintenanceData({ ...maintenanceData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        asset_id: maintenanceData.assetId,
        maintenance_type: maintenanceData.maintenanceType,
        description: maintenanceData.description,
        date: maintenanceData.date,
        cost: maintenanceData.cost ? parseFloat(maintenanceData.cost) : null,
        performed_by: maintenanceData.performedBy,
      };
      await onAddMaintenance(formattedData);
      setMaintenanceData({
        assetId: '',
        maintenanceType: '',
        description: '',
        date: '',
        cost: '',
        performedBy: '',
      });
      onClose();
    } catch (error) {
      console.error('Error submitting maintenance data:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">Add Maintenance Record</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assetId">
              Asset
            </label>
            <select
              name="assetId"
              value={maintenanceData.assetId}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select an asset</option>
              {assets.map((asset) => (
                <option key={asset.asset_id} value={asset.asset_id}>
                  {asset.assetName} 
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maintenanceType">
              Maintenance Type
            </label>
            <select
              name="maintenanceType"
              value={maintenanceData.maintenanceType}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select maintenance type</option>
              {maintenanceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              name="description"
              value={maintenanceData.description}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Maintenance Date
            </label>
            <input
              type="date"
              name="date"
              value={maintenanceData.date}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cost">
              Maintenance Cost
            </label>
            <input
              type="number"
              name="cost"
              value={maintenanceData.cost}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="performedBy">
              Performed By
            </label>
            <input
              type="text"
              name="performedBy"
              value={maintenanceData.performedBy}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Maintenance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
