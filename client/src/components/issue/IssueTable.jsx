import React, { useState } from 'react';
import moment from 'moment';
import AssetDetailsModal from '../assetlists/AssetDetailsModal';
import { Wrench, Trash2 } from 'lucide-react';

const IssueTable = ({ issues, assets, loading, onAddToMaintenance, onRemoveIssue }) => {
  const [selectedAsset, setSelectedAsset] = useState(null);

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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in maintenance':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRowClick = (assetId) => {
    const asset = assets.find(a => a.asset_id === assetId);
    if (asset) {
      setSelectedAsset(asset);
    }
  };

  const handleAddToMaintenance = (e, issue) => {
    e.stopPropagation();
    const asset = assets.find(a => a.asset_id === issue.asset_id);
    onAddToMaintenance(issue, asset);
  };

  const handleRemoveIssue = (e, issueId) => {
    e.stopPropagation();
    onRemoveIssue(issueId);
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asset
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Issue Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Maintenance Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reported By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Reported
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {issues.map((issue) => {
            const asset = assets.find(a => a.asset_id === issue.asset_id);
            return (
              <tr 
                key={issue.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(issue.asset_id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {asset?.assetName || 'Unknown Asset'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {issue.issue_type}
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs overflow-hidden text-ellipsis">
                    {issue.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img 
                      src={issue.user_picture || "https://via.placeholder.com/30"} 
                      alt={issue.reported_by || 'Unknown User'} 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span>{issue.reported_by || 'Unknown User'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {moment(issue.created_at).format('MMM DD, YYYY h:mm A')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleAddToMaintenance(e, issue)}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                      title="Add to Maintenance"
                    >
                      <Wrench className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleRemoveIssue(e, issue.id)}
                      className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100"
                      title="Remove Issue"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {issues.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No issues reported yet.
        </div>
      )}

      {selectedAsset && (
        <AssetDetailsModal
          selectedAsset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </div>
  );
};

export default IssueTable;
