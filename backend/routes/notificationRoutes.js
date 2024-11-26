const express = require("express");
const NotificationController = require("../controllers/notificationController");
const router = express.Router();

router.get("/", NotificationController.getNotificationSettings);
router.put("/", NotificationController.updateNotificationEmail);
router.put("/toggle", NotificationController.toggleNotifications);
router.post("/pending-alert", NotificationController.sendPendingAlert);

module.exports = router;
