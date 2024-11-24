import React, { useState } from 'react';
import moment from 'moment';
import DeleteConfirmationModal from '../utils/DeleteConfirmationModal';

const IssueTable = ({ issues, assets, loading, onAddToRepair, onRemoveIssue, onEditIssue }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);

  // Filter out issues that are in repair status
  const activeIssues = issues.filter(issue => issue.status !== 'In Repair');

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (issue) => {
    setIssueToDelete(issue);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (issueToDelete) {
      onRemoveIssue(issueToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setIssueToDelete(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-black">
          <tr>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Asset</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Issue Type</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Description</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Priority</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Quantity</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Reported By</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Date Reported</th>
            <th className="px-4 py-2 text-center text-[#FEC00F]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activeIssues.map((issue) => {
            const asset = assets.find(a => a.asset_id === issue.asset_id);
            const assetName = asset ? asset.assetName : issue.asset_id;
            const productCode = asset?.productCode && asset.productCode !== 'N/A' ? asset.productCode : null;
            
            return (
              <tr key={issue.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-medium">{assetName}</span>
                    {productCode && (
                      <span className="text-sm text-gray-600">
                        Product Code: {productCode}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-center">{issue.issue_type}</td>
                <td className="px-4 py-2 text-center">{issue.description}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <span className="font-medium">{issue.issue_quantity}</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-center">
                    {issue.user_picture && (
                      <img 
                        src={issue.user_picture} 
                        alt={issue.reported_by} 
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    {issue.reported_by}
                  </div>
                </td>
                <td className="px-4 py-2 text-center">
                  {moment(issue.created_at).format('MM/DD/YYYY')}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onEditIssue(issue)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(issue)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => onAddToRepair(issue, asset)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                    >
                      Repair
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this issue? This action cannot be undone."
      />

      {activeIssues.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No active issues found
        </div>
      )}
    </div>
  );
};

export default IssueTable;
