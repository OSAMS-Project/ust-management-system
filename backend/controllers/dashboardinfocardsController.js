const Asset = require('../models/asset');
const User = require('../models/user');
const Event = require('../models/events');
const BorrowingRequest = require('../models/borrowingrequest');

exports.getTotalAssets = async (req, res) => {
  try {
    const totalAssets = await Asset.getTotalAssets();
    res.json({ totalAssets });
  } catch (error) {
    console.error('Error getting total assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.getTotalUsers();
    res.json({ totalUsers });
  } catch (error) {
    console.error('Error getting total users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add this new function
exports.getTotalEvents = async (req, res) => {
  try {
    const totalEvents = await Event.getTotalEvents();
    res.json({ totalEvents });
  } catch (error) {
    console.error('Error getting total events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add this new function
exports.getRecentlyAddedAssets = async (req, res) => {
  try {
    const recentAssets = await Asset.getRecentlyAddedAssets(5);
    res.json(recentAssets);
  } catch (error) {
    console.error('Error getting recently added assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add this new function
exports.getRecentEvents = async (req, res) => {
  try {
    const recentEvents = await Event.getRecentEvents(5);
    res.json(recentEvents);
  } catch (error) {
    console.error('Error getting recent events:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

exports.getTotalAssetsForBorrowing = async (req, res) => {
  try {
    const totalAssetsForBorrowing = await Asset.getTotalAssetsForBorrowing();
    res.json({ totalAssetsForBorrowing });
  } catch (error) {
    console.error('Error getting total assets for borrowing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTotalPendingRequests = async (req, res) => {
  try {
    const totalPendingRequests = await BorrowingRequest.getTotalPendingRequests();
    res.json({ totalPendingRequests });
  } catch (error) {
    console.error('Error getting total pending requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTotalAcceptedRequests = async (req, res) => {
  try {
    const totalAcceptedRequests = await BorrowingRequest.getTotalAcceptedRequests();
    res.json({ totalAcceptedRequests });
  } catch (error) {
    console.error('Error getting total accepted requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
