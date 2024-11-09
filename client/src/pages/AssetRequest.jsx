import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AssetRequestTable from '../components/assetrequest/AssetRequestTable';
import ApprovedRequestTable from '../components/assetrequest/ApprovedRequestTable';
import DeclinedRequestTable from '../components/assetrequest/DeclinedRequestTable';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";

const AssetRequest = ({ user }) => {
  const [assetRequests, setAssetRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [declinedRequests, setDeclinedRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    assetName: '',
    quantity: ''
  });

  console.log('User in AssetRequests:', user);

  const fetchAllRequests = async () => {
    try {
      // Fetch pending requests
      const pendingResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/asset-request`);
      setAssetRequests(pendingResponse.data);

      // Fetch approved requests
      const approvedResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/asset-request/approved`);
      setApprovedRequests(approvedResponse.data);

      // Fetch declined requests
      const declinedResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/asset-request/declined`);
      setDeclinedRequests(declinedResponse.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/asset-request`, assetData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Response:', response.data);
      setIsModalOpen(false);
      fetchAllRequests();
      setNewAsset({ assetName: '', quantity: '' });
    } catch (error) {
      console.error('Error adding asset request:', error.response?.data || error.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/asset-request/${id}/approve`);
      fetchAllRequests(); // Fetch all requests again after approval
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/asset-request/${id}/decline`);
      fetchAllRequests(); // Fetch all requests again after declining
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const handleArchive = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/asset-request/${id}/archive`);
      fetchAllRequests(); // Refresh all requests after archiving
    } catch (error) {
      console.error('Error archiving request:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">
          Asset Request
        </h1>
        <FontAwesomeIcon
          icon={faBoxOpen}
          className="text-black text-5xl transform"
        />
      </div>

      <div className="flex items-center mb-4 px-2">
        <img src={user?.picture || "https://via.placeholder.com/40"} alt="Profile" className="w-10 h-10 rounded-full object-cover mr-2" />
        <p className="text-lg">Logged in as: {user?.name || "User"}</p>
      </div>

      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 ml-2"
      >
        Add Asset Request
      </button>

      <div id='recipients' className="p-4 mt-4 lg:mt-0 rounded shadow bg-white">
        <AssetRequestTable 
          assetRequests={assetRequests} 
          onApprove={handleApprove}
          onDecline={handleDecline}
        />
        <ApprovedRequestTable 
          approvedRequests={approvedRequests} 
          onArchive={handleArchive}
        />
        <DeclinedRequestTable 
          declinedRequests={declinedRequests} 
          onArchive={handleArchive}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Asset Request</h2>
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
