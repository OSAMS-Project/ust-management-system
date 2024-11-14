const express = require('express');
const router = express.Router();
const assetIssueController = require('../controllers/assetissueController');

// Make sure this route is before any routes with parameters
router.get('/history', assetIssueController.getIssueHistory);

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

// Get issue logs by asset ID
router.get('/logs/:assetId', assetIssueController.getIssueLogsByAsset);

// Update issue
router.put('/:id', assetIssueController.updateIssue);

module.exports = router;

