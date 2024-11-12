import React, { useState, useEffect } from 'react';
import AddAssetIssue from '../components/issue/AddAssetIssue';
import IssueTable from '../components/issue/IssueTable';
import RepairModal from '../components/repair/RepairModal';
import NotificationPopup from '../components/utils/NotificationsPopup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AssetIssue({ user }) {
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
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
        issue.status !== 'In Repair' && issue.status !== 'Resolved'
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

  const handleAddToRepair = (issue, asset) => {
    console.log('Selected Issue:', issue);
    setSelectedIssue({
      ...issue,
      quantity: issue.quantity || 1,
      asset: asset
    });
    setIsRepairModalOpen(true);
  };

  const handleAddRepair = async (repairData) => {
    try {
      console.log('Repair Data being sent:', repairData);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/repair/create`,
        {
          ...repairData,
          quantity: selectedIssue.quantity
        }
      );

      if (response.data) {
        // Update issue status to "In Repair"
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/asset-issues/${selectedIssue.id}/status`,
          { status: 'In Repair' }
        );

        // Remove from current view
        setIssues(prevIssues => 
          prevIssues.filter(issue => issue.id !== selectedIssue.id)
        );

        // Update asset repair status - Fixed endpoint
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/assets/${selectedIssue.asset_id}/repair-status`,
            { under_repair: true }
          );
        } catch (error) {
          console.error('Error updating asset repair status:', error);
        }

        setNotification({
          type: 'success',
          message: 'Issue moved to repair successfully'
        });

        setIsRepairModalOpen(false);
        navigate('/repair');
      }
    } catch (error) {
      console.error('Error creating repair record:', error);
      setNotification({
        type: 'error',
        message: 'Failed to create repair record'
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
        onAddToRepair={handleAddToRepair}
        onRemoveIssue={handleRemoveIssue}
      />

      {isRepairModalOpen && (
        <RepairModal
          isOpen={isRepairModalOpen}
          onClose={() => setIsRepairModalOpen(false)}
          onAddRepair={handleAddRepair}
          initialData={{
            assetId: selectedIssue?.asset_id,
            description: `Issue Report: ${selectedIssue?.description}`,
            repairType: 'Corrective Repair'
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
