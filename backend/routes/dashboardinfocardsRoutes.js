const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const dashboardInfoCardsController = require("../controllers/dashboardinfocardsController");
const Event = require("../models/events");

router.get("/total-assets", dashboardInfoCardsController.getTotalAssets);
router.get("/total-users", dashboardInfoCardsController.getTotalUsers);
router.get("/total-events", dashboardInfoCardsController.getTotalEvents);
router.get(
  "/recent-assets",
  dashboardInfoCardsController.getRecentlyAddedAssets
);
router.get("/recent-events", dashboardInfoCardsController.getRecentEvents);
router.get(
  "/total-assets-for-borrowing",
  dashboardInfoCardsController.getTotalAssetsForBorrowing
);
router.get(
  "/total-pending-requests",
  dashboardInfoCardsController.getTotalPendingRequests
);
router.get(
  "/total-accepted-requests",
  dashboardInfoCardsController.getTotalAcceptedRequests
);
router.get(
  "/total-incoming-assets",
  dashboardInfoCardsController.getTotalIncomingAssets
);
router.get("/total-repairs", dashboardInfoCardsController.getTotalRepairs);

module.exports = router;
