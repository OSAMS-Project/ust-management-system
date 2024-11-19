import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AssetRequestTable from '../components/assetrequest/AssetRequestTable';
import ApprovedRequestTable from '../components/assetrequest/ApprovedRequestTable';
import DeclinedRequestTable from '../components/assetrequest/DeclinedRequestTable';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import AssetRequestModal from '../components/assetrequest/AssetRequestModal';

const AssetRequest = ({ user }) => {
  const [assetRequests, setAssetRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [declinedRequests, setDeclinedRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    assetName: '',
    quantity: '',
    comments: ''
  });

  console.log('User in AssetRequests:', user);

  const fetchAllRequests = useCallback(async () => {
    try {
      console.log('Fetching all requests...');
      const [pendingRes, declinedRes, approvedRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/asset-request`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/asset-request/declined`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/asset-request/approved`)
      ]);

      setAssetRequests(pendingRes.data);
      const sortedDeclined = declinedRes.data.sort((a, b) => 
        new Date(b.declined_at) - new Date(a.declined_at)
      );
      setDeclinedRequests(sortedDeclined);
      setApprovedRequests(approvedRes.data);
      
      console.log('Updated requests:', {
        pending: pendingRes.data,
        declined: declinedRes.data,
        approved: approvedRes.data
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }, []);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAsset(prev => ({
      ...prev,
      [name]: value
    }));
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
      setNewAsset({
        assetName: '',
        quantity: '',
        comments: ''
      });
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

  const handleDecline = async (requestData) => {
    const isAutoDeclined = typeof requestData === 'object' && requestData.auto_declined;
    const requestId = isAutoDeclined ? requestData.id : requestData;

    try {
      // Find the request that's being declined
      const requestToDecline = assetRequests.find(req => req.id === requestId);
      if (!requestToDecline) return;

      // Immediately remove from pending requests
      setAssetRequests(prev => prev.filter(req => req.id !== requestId));

      // Create the declined request object with all necessary data
      const declinedRequest = {
        ...requestToDecline,
        status: 'declined',
        auto_declined: isAutoDeclined,
        declined_at: new Date().toISOString()
      };

      // Add to declined requests immediately
      setDeclinedRequests(prev => [declinedRequest, ...prev]);

      // Make API call
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/asset-request/${requestId}/decline`,
        { 
          status: 'declined',
          auto_declined: isAutoDeclined,
          declined_at: declinedRequest.declined_at
        }
      );

      if (!response.data) {
        // Revert changes if API call fails
        setAssetRequests(prev => [...prev, requestToDecline]);
        setDeclinedRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Error declining request:', error);
      // Revert changes on error
      const requestToDecline = assetRequests.find(req => req.id === requestId);
      if (requestToDecline) {
        setAssetRequests(prev => [...prev, requestToDecline]);
        setDeclinedRequests(prev => prev.filter(req => req.id !== requestId));
      }
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

  const handleOpenModal = () => {
    setNewAsset({
      assetName: '',
      quantity: '',
      comments: ''
    });
    setIsModalOpen(true);
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

    
      <button 
        onClick={handleOpenModal}
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

      <AssetRequestModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newAsset={newAsset}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AssetRequest;
