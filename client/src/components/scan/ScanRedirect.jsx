import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AssetDetailsModal from '../assetlists/AssetDetailsModal';

const ScanRedirect = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        // Check if user exists in localStorage
        const user = localStorage.getItem('user');
        
        if (!user) {
          // If user is not logged in, redirect to login page with return URL
          const returnUrl = `/scan/${assetId}`;
          navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
          return;
        }

        // Fetch asset details
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/assets/${assetId}`, {
          headers: {
            Authorization: `Bearer ${JSON.parse(user).token}`
          }
        });
        
        setAsset(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching asset details:', error);
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [assetId, navigate]);

  const handleClose = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
        <div className="bg-white p-4 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading asset details...</p>
        </div>
      </div>
    );
  }

  return asset ? (
    <AssetDetailsModal
      selectedAsset={asset}
      onClose={handleClose}
    />
  ) : (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg">
        <p className="text-red-500">Asset not found</p>
        <button
          onClick={handleClose}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ScanRedirect;