import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ScanRedirect = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user exists in localStorage
    const user = localStorage.getItem('user');
    
    if (user) {
      // If user is logged in, redirect to asset details
      navigate(`/assets/details/${assetId}`);
    } else {
      // If user is not logged in, redirect to login page with return URL
      const returnUrl = `/assets/details/${assetId}`;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [assetId, navigate]);

  return <div>Redirecting...</div>;
};

export default ScanRedirect; 