import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const IncomingAssets = () => {
  const [assets, setAssets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [formData, setFormData] = useState({
    assetName: '',
    description: '',
    type: 'Consumable',
    category: '',
    cost: '',
    quantity: '',
    total_cost: '',
    expected_date: '',
    notes: ''
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchIncomingAssets();
    fetchCategories();
    fetchLocations();
  }, []);

  const fetchIncomingAssets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/incoming-assets`);
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching incoming assets:', error);
      toast.error('Failed to fetch incoming assets');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
      setCategories(response.data.map(cat => cat.category_name));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/locations`);
      setLocations(response.data.map(loc => loc.location_name));
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch locations');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // Automatically calculate total cost when cost or quantity changes
      if (name === 'cost' || name === 'quantity') {
        const cost = parseFloat(newData.cost) || 0;
        const quantity = parseInt(newData.quantity) || 0;
        newData.total_cost = (cost * quantity).toFixed(2);
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/incoming-assets`, formData);
      toast.success('Incoming asset added successfully');
      setShowForm(false);
      setFormData({
        assetName: '',
        description: '',
        type: 'Consumable',
        category: '',
        cost: '',
        quantity: '',
        total_cost: '',
        expected_date: '',
        notes: ''
      });
      fetchIncomingAssets();
    } catch (error) {
      console.error('Error creating incoming asset:', error);
      toast.error('Failed to create incoming asset');
    }
  };

  const handleStatusUpdate = async (asset) => {
    setSelectedAsset(asset);
    setShowLocationDialog(true);
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update status and location together
      await axios.put(`${process.env.REACT_APP_API_URL}/api/incoming-assets/${selectedAsset.id}/status`, {
        status: 'received',
        location: selectedLocation
      });

      // Format the data for the main assets table
      const newAssetData = {
        assetName: selectedAsset.assetName,
        assetDetails: selectedAsset.description || '',
        category: selectedAsset.category,
        location: selectedLocation,
        quantity: parseInt(selectedAsset.quantity) || 0,
        totalCost: parseFloat(selectedAsset.total_cost) || 0,
        cost: parseFloat(selectedAsset.cost) || 0,
        type: selectedAsset.type,
        image: ''
      };

      console.log('Attempting to create asset with data:', newAssetData);

      // Create in main assets
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/Assets/create`, newAssetData);
      console.log('Asset created:', response.data);

      toast.success('Asset received and added to inventory');
      setShowLocationDialog(false);
      setSelectedLocation('');
      fetchIncomingAssets();
    } catch (error) {
      console.error('Error processing asset:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
        toast.error(`Failed to process asset: ${error.response.data.error || error.message}`);
      } else {
        toast.error(`Failed to process asset: ${error.message}`);
      }
    }
  };

  // Add this to separate pending and received assets
  const pendingAssets = assets.filter(asset => asset.status === 'pending');
  const receivedAssets = assets.filter(asset => asset.status === 'received');

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Incoming Assets</h1>
          <p className="text-gray-600">Manage and track incoming asset deliveries</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Asset
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add New Incoming Asset</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asset Name</label>
                <input
                  type="text"
                  name="assetName"
                  value={formData.assetName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="Consumable">Consumable</option>
                  <option value="Non-Consumable">Non-Consumable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Cost per Unit</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total Cost</label>
                <input
                  type="number"
                  name="total_cost"
                  value={formData.total_cost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Date</label>
                <input
                  type="datetime-local"
                  name="expected_date"
                  value={formData.expected_date}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLocationDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Select Storage Location</h2>
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Storage Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a location</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLocationDialog(false);
                    setSelectedLocation('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Assets Table */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Assets</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingAssets.map((asset) => (
                <tr key={asset.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{asset.assetName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{asset.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{asset.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{asset.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₱{asset.total_cost}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleStatusUpdate(asset)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Mark as Received
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Received Assets Table */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Received Assets</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receivedAssets.map((asset) => (
                <tr key={asset.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{asset.assetName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{asset.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{asset.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{asset.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₱{asset.total_cost}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{asset.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(asset.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncomingAssets;
