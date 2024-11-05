import React, { useState, useEffect } from 'react';
import AddAssetIssue from '../components/issue/AddAssetIssue';
import IssueTable from '../components/issue/IssueTable';
import NotificationPopup from '../components/utils/NotificationsPopup';
import axios from 'axios';

function AssetIssue({ user }) {
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchIssues();
    fetchAssets();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/asset-issues`);
      setIssues(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching issues:', error);
      setLoading(false);
      setNotification({
        type: 'error',
        message: 'Failed to fetch issues. Please try again.'
      });
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Assets/read`);
      const nonConsumableAssets = response.data.filter(asset => asset.type === 'Non-Consumable');
      setAssets(nonConsumableAssets);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setNotification({
        type: 'error',
        message: 'Failed to fetch assets. Please try again.'
      });
    }
  };

  const handleAddIssue = async (issueData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/asset-issues`, {
        ...issueData,
        reported_by: user?.name,
        user_picture: user?.picture
      });
      setIssues([response.data, ...issues]);
      setIsModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Issue reported successfully!'
      });
    } catch (error) {
      console.error('Error adding issue:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.error || 'Failed to report issue. Please try again.'
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Asset Issues</h1>
          <div className="flex items-center mt-2">
            <img 
              src={user?.picture || "https://via.placeholder.com/40"} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover mr-2" 
            />
            <p className="text-lg">Logged in as: {user?.name || "User"}</p>
          </div>
        </div>
        <AddAssetIssue
          onAddIssue={handleAddIssue}
          assets={assets}
          isModalOpen={isModalOpen}
          onCloseModal={() => setIsModalOpen(false)}
          onOpenModal={() => setIsModalOpen(true)}
          user={user}
        />
      </div>

      <IssueTable 
        issues={issues}
        assets={assets}
        loading={loading}
      />
      <NotificationPopup 
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}

export default AssetIssue;
