import React, { useState, useEffect } from 'react';
import AddAssetIssue from '../components/issue/AddAssetIssue';
import IssueTable from '../components/issue/IssueTable';
import RepairModal from '../components/repair/RepairModal';
import NotificationPopup from '../components/utils/NotificationsPopup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EditIssueModal from '../components/issue/EditIssueModal';
import PaginationControls from '../components/assetlists/PaginationControls';

function AssetIssue({ user }) {
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    const issueWithAsset = {
      ...issue,
      repair_quantity: issue.issue_quantity,
      asset: {
        asset_id: issue.asset_id,
        assetName: asset?.assetName || 'Unknown Asset'
      }
    };
    setSelectedIssue(issueWithAsset);
    setIsRepairModalOpen(true);
  };

  const handleAddRepair = async (formData) => {
    try {
      if (!formData.asset_id) {
        throw new Error('Asset ID is required');
      }

      const repairData = {
        ...formData,
        asset_id: formData.asset_id,
        repair_quantity: formData.quantity,
        issue_id: formData.issue_id
      };

      console.log('Creating repair record with data:', repairData);
      
      // Create repair record
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/repair/create`, 
        repairData
      );

      // Update asset status to under repair
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/Assets/${formData.asset_id}/status`,
        { 
          under_repair: true,
          has_issue: true
        }
      );

      // Update issue status to In Repair
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/asset-issues/${formData.issue_id}/status`,
        { status: 'In Repair' }
      );

      // Update the issues list to reflect the new repair
      const updatedIssues = issues.filter(issue => issue.id !== formData.issue_id);
      setIssues(updatedIssues);

      setIsRepairModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Repair record created successfully'
      });

    } catch (error) {
      console.error('Error creating repair record:', error);
      setNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to create repair record'
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

  const handleEditIssue = async (issueId, editData) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/asset-issues/${issueId}`,
        editData
      );

      // Update issues list with edited issue
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, ...editData } : issue
      ));

      setIsEditModalOpen(false);
      setSelectedIssue(null);
      setNotification({
        type: 'success',
        message: 'Issue updated successfully'
      });
    } catch (error) {
      console.error('Error updating issue:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update issue'
      });
    }
  };

  const handleOpenEditModal = (issue) => {
    setSelectedIssue(issue);
    setIsEditModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const calculateStartIndex = () => (currentPage - 1) * itemsPerPage + 1;
  const calculateEndIndex = () => Math.min(calculateStartIndex() + itemsPerPage - 1, issues.length);
  const totalPages = Math.ceil(issues.length / itemsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    pageNumbers.push(
      ...Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index
      ).map((i) => (
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            i === currentPage
              ? "z-10 bg-[#FEC00F] text-black font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FEC00F]"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
          }`}
        >
          {i}
        </button>
      ))
    );

    return pageNumbers;
  };

  const paginatedIssues = issues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Asset Issues</h1>
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
        issues={paginatedIssues}
        assets={assets}
        loading={loading}
        onAddToRepair={handleAddToRepair}
        onRemoveIssue={handleRemoveIssue}
        onEditIssue={handleOpenEditModal}
      />

      {issues.length > 0 && (
        <PaginationControls
          itemsPerPage={itemsPerPage}
          handleItemsPerPageChange={handleItemsPerPageChange}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          calculateStartIndex={calculateStartIndex}
          calculateEndIndex={calculateEndIndex}
          totalItems={issues.length}
          renderPageNumbers={renderPageNumbers}
        />
      )}

      {isRepairModalOpen && (
        <RepairModal
          isOpen={isRepairModalOpen}
          onClose={() => setIsRepairModalOpen(false)}
          onAddRepair={handleAddRepair}
          selectedIssue={selectedIssue}
          selectedAsset={selectedIssue?.asset}
        />
      )}

      {isEditModalOpen && selectedIssue && (
        <EditIssueModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedIssue(null);
          }}
          onEditIssue={handleEditIssue}
          issue={selectedIssue}
          assets={assets}
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
