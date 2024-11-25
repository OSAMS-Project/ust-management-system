const Asset = require("../models/assets");
const User = require("../models/user");
const Event = require("../models/events");
const BorrowingRequest = require("../models/borrowingrequest");
const IncomingAssets = require("../models/incomingassets");
const Repairs = require("../models/Repair");

// Get all dashboard data
exports.getAllDashboardData = async (req, res) => {
  try {
    const totalAssets = await Asset.getTotalAssets();
    const totalEvents = await Event.getTotalEvents();
    const totalAssetsForBorrowing = await Asset.getTotalAssetsForBorrowing();
    const totalPendingRequests = await BorrowingRequest.getTotalPendingRequests();
    const totalAcceptedRequests = await BorrowingRequest.getTotalAcceptedRequests();
    const totalIncomingAssets = await IncomingAssets.getTotalIncomingAssets();
    const totalRepairs = await Repairs.getTotalRepairs();

    res.json({
      totalAssets,
      totalEvents,
      totalAssetsForBorrowing,
      totalPendingRequests,
      totalAcceptedRequests,
      totalIncomingAssets,
      totalRepairs,
    });
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};