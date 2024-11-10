import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Separate assets by status first, then apply pagination
  const pendingAssets = assets.filter(asset => asset.status === 'pending');
  const receivedAssets = assets.filter(asset => asset.status === 'received');

  // Calculate pagination for each table separately
  const totalPendingPages = Math.ceil(pendingAssets.length / itemsPerPage);
  const totalReceivedPages = Math.ceil(receivedAssets.length / itemsPerPage);

  // Get current page items for each table
  const currentPendingAssets = pendingAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const currentReceivedAssets = receivedAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Add console logs to debug
  console.log('All assets:', assets);
  console.log('Received assets:', receivedAssets);
  console.log('Current received assets:', currentReceivedAssets);

  return (
    <div className="p-6">
      <ToastContainer />

      {/* Controls Section */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Incoming Asset
        </button>
      </div>

      {/* Pending Assets Table */}
      <div className="mt-2">
        <h2 className="text-2xl font-bold mb-4">Pending Assets ({pendingAssets.length})</h2>
        <table className="min-w-full bg-white border-collapse">
          <thead className="bg-black text-[#FEC00F]">
            <tr>
              <th className="py-2 px-4 border-b text-center">Asset Name</th>
              <th className="py-2 px-4 border-b text-center">Type</th>
              <th className="py-2 px-4 border-b text-center">Category</th>
              <th className="py-2 px-4 border-b text-center">Quantity</th>
              <th className="py-2 px-4 border-b text-center">Total Cost</th>
              <th className="py-2 px-4 border-b text-center">Expected Date</th>
              <th className="py-2 px-4 border-b text-center">Status</th>
              <th className="py-2 px-4 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPendingAssets.map((asset, index) => (
              <tr
                key={asset.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
                } cursor-pointer hover:bg-gray-50`}
              >
                <td className="py-2 px-4 border-b text-center">{asset.assetName}</td>
                <td className="py-2 px-4 border-b text-center">{asset.type}</td>
                <td className="py-2 px-4 border-b text-center">{asset.category}</td>
                <td className="py-2 px-4 border-b text-center">{asset.quantity}</td>
                <td className="py-2 px-4 border-b text-center">₱{asset.total_cost}</td>
                <td className="py-2 px-4 border-b text-center">
                  {moment(asset.expected_date).format("MM/DD/YYYY")}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {asset.status}
                  </span>
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleStatusUpdate(asset)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition duration-300"
                  >
                    Mark as Received
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Received Assets Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Received Assets ({receivedAssets.length})</h2>
        <table className="min-w-full bg-white border-collapse">
          <thead className="bg-black text-[#FEC00F]">
            <tr>
              <th className="py-2 px-4 border-b text-center">Asset Name</th>
              <th className="py-2 px-4 border-b text-center">Type</th>
              <th className="py-2 px-4 border-b text-center">Category</th>
              <th className="py-2 px-4 border-b text-center">Quantity</th>
              <th className="py-2 px-4 border-b text-center">Total Cost</th>
              <th className="py-2 px-4 border-b text-center">Status</th>
              <th className="py-2 px-4 border-b text-center">Location</th>
              <th className="py-2 px-4 border-b text-center">Received Date</th>
            </tr>
          </thead>
          <tbody>
            {currentReceivedAssets.length > 0 ? (
              currentReceivedAssets.map((asset, index) => (
                <tr
                  key={asset.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
                  } cursor-pointer hover:bg-gray-50`}
                >
                  <td className="py-2 px-4 border-b text-center">{asset.assetName}</td>
                  <td className="py-2 px-4 border-b text-center">{asset.type}</td>
                  <td className="py-2 px-4 border-b text-center">{asset.category}</td>
                  <td className="py-2 px-4 border-b text-center">{asset.quantity}</td>
                  <td className="py-2 px-4 border-b text-center">₱{asset.total_cost}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b text-center">{asset.location}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {moment(asset.updated_at).format("MM/DD/YYYY")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-4 text-center text-gray-500">No received assets yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Incoming Asset</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Select Storage Location</h2>
              <button
                onClick={() => setShowLocationDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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
    </div>
  );
};

export default IncomingAssets;
