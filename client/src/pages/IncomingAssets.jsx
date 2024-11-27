import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NotificationPopup from '../components/utils/NotificationsPopup';
import AddIncomingAssetForm from '../components/incomingassets/AddIncomingAssetForm';
import LocationDialog from '../components/incomingassets/LocationDialog';
import IncomingAssetsTable from '../components/incomingassets/IncomingAssetsTable';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruckFast } from "@fortawesome/free-solid-svg-icons";

const IncomingAssets = () => {
  const [assets, setAssets] = useState([]);
  const [receivedAssets, setReceivedAssets] = useState([]);
  const [currentReceivedAssets, setCurrentReceivedAssets] = useState([]);
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [receivedCurrentPage, setReceivedCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
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
  const [notification, setNotification] = useState(null);
  const [currentPendingAssets, setCurrentPendingAssets] = useState([]);

  useEffect(() => {
    fetchAssets();
    fetchCategories();
    fetchLocations();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/incoming-assets`);
      const allAssets = response.data;
      
      const pending = allAssets.filter(asset => asset.status !== 'received');
      const received = allAssets.filter(asset => asset.status === 'received');
      
      setAssets(allAssets);
      setCurrentPendingAssets(pending.slice(0, itemsPerPage));
      setReceivedAssets(received);
      setCurrentReceivedAssets(received.slice(0, itemsPerPage));
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
      setCategories(response.data.map(cat => cat.category_name));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setNotification({ type: 'error', message: 'Failed to fetch categories' });
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/locations`);
      setLocations(response.data.map(loc => loc.location_name));
    } catch (error) {
      console.error('Error fetching locations:', error);
      setNotification({ type: 'error', message: 'Failed to fetch locations' });
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
      setNotification({ type: 'success', message: 'Incoming asset added successfully' });
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
      fetchAssets();
    } catch (error) {
      console.error('Error creating incoming asset:', error);
      setNotification({ type: 'error', message: 'Failed to create incoming asset' });
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
        image: null,
        productCode: selectedAsset.productCode || 'N/A',
        serialNumber: 'N/A'
      };

      console.log('Attempting to create asset with data:', newAssetData);

      // Create in main assets
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/Assets/create`, newAssetData);
      console.log('Asset created:', response.data);

      setNotification({ type: 'success', message: 'Asset received and added to inventory' });
      setShowLocationDialog(false);
      setSelectedLocation('');
      fetchAssets();
    } catch (error) {
      console.error('Error processing asset:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
        setNotification({ 
          type: 'error', 
          message: `Failed to process asset: ${error.response.data.error || error.message}` 
        });
      } else {
        setNotification({ 
          type: 'error', 
          message: `Failed to process asset: ${error.message}` 
        });
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const resetFormData = () => {
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
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-4">
        <h1 className="text-5xl font-extrabold text-black">
          Incoming Assets
        </h1>
        <FontAwesomeIcon
          icon={faTruckFast}
          className="text-black text-5xl transform"
        />
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors m-3"
      >
        Add Incoming Asset
      </button>

      <div id='recipients' className="mt-4 lg:mt-0 rounded bg-white">
        <IncomingAssetsTable 
          assets={assets}
          handleStatusUpdate={handleStatusUpdate}
          pendingCurrentPage={pendingCurrentPage}
          setPendingCurrentPage={setPendingCurrentPage}
          receivedCurrentPage={receivedCurrentPage}
          setReceivedCurrentPage={setReceivedCurrentPage}
          itemsPerPage={itemsPerPage}
          receivedAssets={receivedAssets}
          currentReceivedAssets={currentReceivedAssets}
          currentPendingAssets={currentPendingAssets}
        />
      </div>

      {showForm && (
        <AddIncomingAssetForm 
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          setShowForm={setShowForm}
          categories={categories}
          today={today}
          setNotification={setNotification}
          resetFormData={resetFormData}
        />
      )}

      {showLocationDialog && (
        <LocationDialog 
          showLocationDialog={showLocationDialog}
          setShowLocationDialog={setShowLocationDialog}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          locations={locations}
          handleLocationSubmit={handleLocationSubmit}
        />
      )}

      <NotificationPopup
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default IncomingAssets;
