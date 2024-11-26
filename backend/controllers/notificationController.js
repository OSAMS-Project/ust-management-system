const NotificationModel = require("../models/Notifications");
const emailService = require("../services/emailService");
const nodemailer = require("nodemailer");

const getNotificationSettings = async (req, res) => {
  try {
    const settings = await NotificationModel.getNotificationSettings();
    if (!settings.notification_email) {
      console.warn("No Notification Email Set");
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const updateNotificationEmail = async (req, res) => {
  const { notificationEmail } = req.body;

  if (!notificationEmail) {
    return res.status(400).json({ message: "Notification email is required." });
  }

  try {
    const updated = await NotificationModel.updateNotificationEmail(
      notificationEmail
    );
    res
      .status(200)
      .json({ message: "Notification email updated successfully.", updated });
  } catch (error) {
    console.error("Error updating notification email:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const toggleNotifications = async (req, res) => {
  const { notificationsEnabled } = req.body;

  if (typeof notificationsEnabled !== "boolean") {
    return res.status(400).json({ message: "Invalid toggle value." });
  }

  try {
    const updatedToggle = await NotificationModel.updateNotificationsEnabled(
      notificationsEnabled
    );
    res.status(200).json({ notificationsEnabled: updatedToggle });
  } catch (error) {
    console.error("Error toggling notifications:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const sendPendingAlert = async (req, res) => {
    const { email, pendingCount } = req.body;
  
    try {
      const result = await emailService.sendPendingAlert(email, pendingCount);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error sending pending alert:", error);
      res.status(500).json({ message: error.message });
    }
  };

module.exports = {
  getNotificationSettings,
  updateNotificationEmail,
  toggleNotifications,
  sendPendingAlert,
};
