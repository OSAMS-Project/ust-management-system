import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AssetDetailsModal from '../components/assetlists/AssetDetailsModal';

const AssetDetailsPage = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Assets/${assetId}`);
        console.log('Fetched asset:', response.data);
        setAsset(response.data);
      } catch (error) {
        console.error('Error fetching asset:', error);
        // Handle error - maybe show error message or redirect
      }
    };

    fetchAsset();
  }, [assetId]);

  if (!asset) return <div>Loading...</div>;

  return (
    <AssetDetailsModal
      selectedAsset={asset}
      onClose={() => navigate(-1)}
    />
  );
};

export default AssetDetailsPage; 