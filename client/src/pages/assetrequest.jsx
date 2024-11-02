import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AssetRequest = ({ user }) => {
  const [incomingAssets, setIncomingAssets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    assetName: '',
    quantity: '',
    expectedArrival: ''
  });

  console.log('User in IncomingAssets:', user);

  useEffect(() => {
    fetchIncomingAssets();
  }, []);

  const fetchIncomingAssets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/incoming-assets`);
      console.log('Fetched incoming assets:', response.data);
      setIncomingAssets(response.data);
    } catch (error) {
      console.error('Error fetching incoming assets:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewAsset({ ...newAsset, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.name || !user.picture) {
      console.error('User information is not available');
      return;
    }
    try {
      const assetData = {
        ...newAsset,
        created_by: user.name,
        user_picture: user.picture
      };
      console.log('Sending asset data:', assetData);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/incoming-assets`, assetData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Response:', response.data);
      setIsModalOpen(false);
      fetchIncomingAssets();
      setNewAsset({ assetName: '', quantity: '', expectedArrival: '' });
    } catch (error) {
      console.error('Error adding incoming asset:', error.response?.data || error.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Asset Request</h1>
      <div className="flex items-center mb-4">
        <img src={user?.picture || "https://via.placeholder.com/40"} alt="Profile" className="w-10 h-10 rounded-full object-cover mr-2" />
        <p className="text-lg">Logged in as: {user?.name || "User"}</p>
      </div>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Add Incoming Asset
      </button>
      
      {/* Table for displaying incoming assets */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Asset Name</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Expected Arrival</th>
            <th className="border p-2">Created By</th>
          </tr>
        </thead>
        <tbody>
          {incomingAssets.map((asset, index) => (
            <tr key={index}>
              <td className="border p-2">{asset.asset_name}</td>
              <td className="border p-2">{asset.quantity}</td>
              <td className="border p-2">{new Date(asset.expected_arrival).toLocaleDateString()}</td>
              <td className="border p-2">
                <div className="flex items-center">
                  <img 
                    src={asset.user_picture || "https://via.placeholder.com/30"} 
                    alt={asset.created_by} 
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  {asset.created_by}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Incoming Asset</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="assetName"
                value={newAsset.assetName}
                onChange={handleInputChange}
                placeholder="Asset Name"
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="number"
                name="quantity"
                value={newAsset.quantity}
                onChange={handleInputChange}
                placeholder="Quantity"
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="date"
                name="expectedArrival"
                value={newAsset.expectedArrival}
                onChange={handleInputChange}
                className="w-full p-2 mb-2 border rounded"
              />
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetRequest;
