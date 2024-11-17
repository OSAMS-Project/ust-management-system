import React from 'react';
import moment from 'moment';
import { Wrench, Trash2, Edit } from 'lucide-react';

const IssueTable = ({ issues, assets, loading, onAddToRepair, onRemoveIssue, onEditIssue }) => {
  // Filter out issues that are in repair status
  const activeIssues = issues.filter(issue => issue.status !== 'In Repair');

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
            
            return (
              <tr key={issue.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-center">{assetName}</td>
                <td className="px-4 py-2 text-center">{issue.issue_type}</td>
                <td className="px-4 py-2 text-center">{issue.description}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-white ${
                    issue.priority === 'High' ? 'bg-red-500' :
                    issue.priority === 'Medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}>
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
                <td className="px-4 py-2 text-center">{moment(issue.created_at).format('MM/DD/YYYY')}</td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={() => onEditIssue(issue)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onAddToRepair({
                        ...issue,
                        repair_quantity: issue.issue_quantity
                      }, asset)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      <Wrench className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveIssue(issue.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {activeIssues.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No active issues found
        </div>
      )}
    </div>
  );
};

export default IssueTable;
