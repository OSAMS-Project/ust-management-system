const AssetIssue = require('../models/assetissue');

const createIssue = async (req, res) => {
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

    // Validate quantity is a positive integer
    if (issueData.quantity) {
      const quantity = parseInt(issueData.quantity);
      if (isNaN(quantity) || quantity < 1) {
        return res.status(400).json({
          error: 'Quantity must be a positive number',
          received: issueData.quantity
        });
      }
      issueData.quantity = quantity;
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
};

const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'In Repair', 'In Progress', 'Resolved'];
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
};

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedIssue = await AssetIssue.deleteIssue(id);
    
    if (!deletedIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ 
      message: 'Issue deleted successfully',
      data: deletedIssue,
      success: true
    });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ 
      error: 'Failed to delete issue',
      details: error.message,
      success: false
    });
  }
};

const resolveIssuesByAsset = async (req, res) => {
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
};

const getIssueLogsByAsset = async (req, res) => {
  try {
    const { assetId } = req.params;
    const logs = await AssetIssue.getIssueLogsByAsset(assetId);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching issue logs:', error);
    res.status(500).json({ error: 'Failed to fetch issue logs' });
  }
};

const getIssueHistory = async (req, res) => {
  try {
    console.log('Getting issue history...');
    const history = await AssetIssue.getIssueHistory();
    console.log('History retrieved:', history);
    res.json(history);
  } catch (error) {
    console.error('Error in getIssueHistory:', error);
    res.status(500).json({ 
      error: 'Failed to fetch issue history',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate required fields if they are being updated
    if (updateData.issue_type && !updateData.issue_type.trim()) {
      return res.status(400).json({ error: 'Issue type cannot be empty' });
    }
    if (updateData.description && !updateData.description.trim()) {
      return res.status(400).json({ error: 'Description cannot be empty' });
    }
    if (updateData.priority && !updateData.priority.trim()) {
      return res.status(400).json({ error: 'Priority cannot be empty' });
    }

    // Validate quantity if it's being updated
    if (updateData.issue_quantity) {
      const quantity = parseInt(updateData.issue_quantity);
      if (isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'Quantity must be a positive number' });
      }
      updateData.issue_quantity = quantity;
    }

    const updatedIssue = await AssetIssue.updateIssue(id, updateData);
    
    if (!updatedIssue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(updatedIssue);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ 
      error: 'Failed to update issue',
      details: error.message 
    });
  }
};

const getAllIssues = async (req, res) => {
  try {
    const issues = await AssetIssue.getAllIssues();
    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

module.exports = {
  createIssue,
  updateIssueStatus,
  deleteIssue,
  resolveIssuesByAsset,
  getIssueLogsByAsset,
  getIssueHistory,
  updateIssue,
  getAllIssues
};
