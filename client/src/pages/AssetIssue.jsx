import React, { useState, useEffect } from 'react';
import AddAssetIssue from '../components/issue/AddAssetIssue';
import IssueTable from '../components/issue/IssueTable';
import MaintenanceModal from '../components/maintenance/MaintenanceModal';
import NotificationPopup from '../components/utils/NotificationsPopup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AssetIssue({ user }) {
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
    fetchAssets();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/asset-issues`);
      const activeIssues = response.data.filter(issue => 
        issue.status !== 'In Maintenance' && issue.status !== 'Resolved'
      );
      setIssues(activeIssues);
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

      // Update the issues list
      setIssues([response.data, ...issues]);

      // Update the asset's status in the database
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/Assets/${issueData.asset_id}/issue-status`,
        { has_issue: true }
      );

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

  const handleAddToMaintenance = (issue, asset) => {
    setSelectedIssue({
      ...issue,
      asset: asset
    });
    setIsMaintenanceModalOpen(true);
  };

  const handleAddMaintenance = async (maintenanceData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/Maintenance/create`,
        maintenanceData
      );

      if (response.data) {
        // Update issue status to "In Maintenance"
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/asset-issues/${selectedIssue.id}/status`,
          { status: 'In Maintenance' }
        );

        // Remove only from the current view, but keep in database
        setIssues(prevIssues => 
          prevIssues.filter(issue => issue.id !== selectedIssue.id)
        );

        // Update asset maintenance status
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/Assets/${selectedIssue.asset_id}/maintenance-status`,
            { under_maintenance: true }
          );
        } catch (error) {
          console.error('Error updating asset maintenance status:', error);
        }

        setNotification({
          type: 'success',
          message: 'Issue moved to maintenance successfully'
        });

        setIsMaintenanceModalOpen(false);
        navigate('/maintenance');
      }
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      setNotification({
        type: 'error',
        message: 'Failed to create maintenance record'
      });
    }
  };

  const handleRemoveIssue = async (issueId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/asset-issues/${issueId}`);
      
      // Update local state
      setIssues(issues.filter(issue => issue.id !== issueId));
      
      setNotification({
        type: 'success',
        message: 'Issue removed successfully'
      });
    } catch (error) {
      console.error('Error removing issue:', error);
      setNotification({
        type: 'error',
        message: 'Failed to remove issue'
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
        onAddToMaintenance={handleAddToMaintenance}
        onRemoveIssue={handleRemoveIssue}
      />

      {isMaintenanceModalOpen && (
        <MaintenanceModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          onAddMaintenance={handleAddMaintenance}
          initialData={{
            assetId: selectedIssue?.asset_id,
            description: `Issue Report: ${selectedIssue?.description}`,
            maintenanceType: 'Corrective Maintenance'
          }}
          selectedAsset={selectedIssue?.asset}
        />
      )}

      <NotificationPopup 
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}

export default AssetIssue;
