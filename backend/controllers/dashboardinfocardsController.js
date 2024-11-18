const Asset = require("../models/assets");
const User = require("../models/user");
const Event = require("../models/events");
const BorrowingRequest = require("../models/borrowingrequest");
const IncomingAssets = require("../models/incomingassets");
const Repairs = require("../models/Repair");

// Get total number of assets
exports.getTotalAssets = async (req, res) => {
  try {
    const totalAssets = await Asset.getTotalAssets();
    res.json({ totalAssets });
  } catch (error) {
    console.error("Error getting total assets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get total users
exports.getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.getTotalUsers();
    res.json({ totalUsers });
  } catch (error) {
    console.error("Error getting total users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get total events
exports.getTotalEvents = async (req, res) => {
  try {
    const totalEvents = await Event.getTotalEvents();
    res.json({ totalEvents: totalEvents || 0 });
  } catch (error) {
    console.error("Error getting total events:", error);
    res.json({ totalEvents: 0 });
  }
};

// Get recently added assets
exports.getRecentlyAddedAssets = async (req, res) => {
  try {
    const recentAssets = await Asset.getRecentlyAddedAssets(5);
    res.json(recentAssets);
  } catch (error) {
    console.error("Error getting recently added assets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get recent events
exports.getRecentEvents = async (req, res) => {
  try {
    const recentEvents = await Event.getRecentEvents(5);
    res.json(recentEvents);
  } catch (error) {
    console.error("Error getting recent events:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// Get total assets for borrowing
exports.getTotalAssetsForBorrowing = async (req, res) => {
  try {
    const totalAssetsForBorrowing = await Asset.getTotalAssetsForBorrowing();
    res.json({ totalAssetsForBorrowing });
  } catch (error) {
    console.error("Error getting total assets for borrowing:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get total pending borrowing requests
exports.getTotalPendingRequests = async (req, res) => {
  try {
    const totalPendingRequests =
      await BorrowingRequest.getTotalPendingRequests();
    res.json({ totalPendingRequests });
  } catch (error) {
    console.error("Error getting total pending requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get total accepted borrowing requests
exports.getTotalAcceptedRequests = async (req, res) => {
  try {
    const totalAcceptedRequests =
      await BorrowingRequest.getTotalAcceptedRequests();
    res.json({ totalAcceptedRequests });
  } catch (error) {
    console.error("Error getting total accepted requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get total incoming assets
exports.getTotalIncomingAssets = async (req, res) => {
  try {
    const totalIncomingAssets = await IncomingAssets.getTotalIncomingAssets();
    res.status(200).json({ totalIncomingAssets });
  } catch (error) {
    console.error("Error getting total incoming assets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get total repairs
exports.getTotalRepairs = async (req, res) => {
  try {
    const totalRepairs = await Repairs.getTotalRepairs();
    res.json({ totalRepairs });
  } catch (error) {
    console.error("Error getting total repairs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
