import React from 'react';
import moment from 'moment';
import { Wrench, Trash2 } from 'lucide-react';

const IssueTable = ({ issues, assets, loading, onAddToRepair, onRemoveIssue }) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  const handleAddToRepair = (issue) => {
    const asset = assets.find(a => a.asset_id === issue.asset_id);
    onAddToRepair(issue, asset);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Asset</th>
            <th className="px-4 py-2 text-left">Issue Type</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Priority</th>
            <th className="px-4 py-2 text-left">Reported By</th>
            <th className="px-4 py-2 text-left">Date Reported</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => {
            const asset = assets.find(a => a.asset_id === issue.asset_id);
            const assetName = asset ? asset.assetName : issue.asset_id;
            
            return (
              <tr key={issue.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{assetName}</td>
                <td className="px-4 py-2">{issue.issue_type}</td>
                <td className="px-4 py-2">{issue.description}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-white ${
                    issue.priority === 'High' ? 'bg-red-500' :
                    issue.priority === 'Medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}>
                    {issue.priority}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
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
                <td className="px-4 py-2">{moment(issue.created_at).format('MM/DD/YYYY')}</td>
                <td className="px-4 py-2">{issue.status}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleAddToRepair(issue)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2"
                    title="Add to Repair"
                  >
                    <Wrench size={16} />
                  </button>
                  <button
                    onClick={() => onRemoveIssue(issue.id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    title="Remove Issue"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default IssueTable;
