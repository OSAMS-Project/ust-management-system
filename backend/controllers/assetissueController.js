const AssetIssue = require('../models/assetissue');

const assetIssueController = {
  getAllIssues: async (req, res) => {
    try {
      const issues = await AssetIssue.getAllIssues();
      res.json(issues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      res.status(500).json({ error: 'Failed to fetch issues' });
    }
  },

  createIssue: async (req, res) => {
    try {
      const issueData = req.body;
      
      // Validate required fields
      if (!issueData.asset_id || !issueData.issue_type || !issueData.description || !issueData.priority) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['asset_id', 'issue_type', 'description', 'priority'],
          received: issueData 
        });
      }

      const newIssue = await AssetIssue.createIssue(issueData);
      res.status(201).json(newIssue);
    } catch (error) {
      console.error('Error creating issue:', error);
      res.status(500).json({ 
        error: 'Failed to create issue',
        details: error.message 
      });
    }
  },

  updateIssueStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['Pending', 'In Maintenance', 'In Progress', 'Resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status',
          validStatuses
        });
      }

      const updatedIssue = await AssetIssue.updateIssueStatus(id, status);
      if (!updatedIssue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      res.json(updatedIssue);
    } catch (error) {
      console.error('Error updating issue status:', error);
      res.status(500).json({ error: 'Failed to update issue status' });
    }
  },

  deleteIssue: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedIssue = await AssetIssue.deleteIssue(id);
      if (!deletedIssue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
      console.error('Error deleting issue:', error);
      res.status(500).json({ error: 'Failed to delete issue' });
    }
  },

  resolveIssuesByAsset: async (req, res) => {
    try {
      const { assetId } = req.params;
      const { status } = req.body;
      
      // Update all issues for this asset to resolved status
      const updatedIssues = await AssetIssue.updateIssueStatusByAsset(assetId, status);
      
      res.json({ 
        message: 'Issues updated successfully',
        updatedIssues 
      });
    } catch (error) {
      console.error('Error resolving issues:', error);
      res.status(500).json({ error: 'Failed to resolve issues' });
    }
  },
};

module.exports = assetIssueController;
