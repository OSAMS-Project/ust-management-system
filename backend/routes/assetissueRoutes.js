const express = require('express');
const router = express.Router();
const assetIssueController = require('../controllers/assetissueController');

// Get all issues
router.get('/', assetIssueController.getAllIssues);

// Create new issue
router.post('/', assetIssueController.createIssue);

// Update issue status
router.put('/:id/status', assetIssueController.updateIssueStatus);

// Delete issue
router.delete('/:id', assetIssueController.deleteIssue);

// Resolve issues by asset ID
router.put('/resolve-by-asset/:assetId', assetIssueController.resolveIssuesByAsset);

module.exports = router;

