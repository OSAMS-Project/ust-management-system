const express = require("express");
const router = express.Router();
const dashboardInfoCardsController = require("../controllers/dashboardinfocardsController");

router.get("/dashboard-data", dashboardInfoCardsController.getAllDashboardData);

module.exports = router;