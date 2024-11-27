import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage = ({ user }) => {
  const [notificationEmail, setNotificationEmail] = useState(""); // Current email
  const [newNotificationEmail, setNewNotificationEmail] = useState(""); // For updates
  const [notificationsEnabled, setNotificationsEnabled] = useState(false); // Toggle state
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/notification-settings`
        );
        const { notification_email, notifications_enabled } = response.data;

        setNotificationEmail(notification_email || "No Notification Email Set");
        setNewNotificationEmail(notification_email || "");
        setNotificationsEnabled(notifications_enabled || false);
      } catch (error) {
        setMessage("Failed to fetch notification settings.");
        console.error("Error fetching notification settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationSettings();
  }, []);

  const handleNotificationEmailChange = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/notification-settings`,
        { notificationEmail: newNotificationEmail }
      );

      setNotificationEmail(response.data.updated.notification_email);
      setMessage("Notification email updated successfully.");
    } catch (error) {
      setMessage("Error updating notification email. Please try again.");
      console.error("Error updating notification email:", error);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/notification-settings/toggle`,
        { notificationsEnabled: !notificationsEnabled }
      );

      setNotificationsEnabled(response.data.notificationsEnabled);
      setMessage(
        `Notifications have been ${
          response.data.notificationsEnabled ? "enabled" : "disabled"
        } successfully.`
      );
    } catch (error) {
      setMessage("Error toggling notifications. Please try again.");
      console.error("Error toggling notifications:", error);
    }
  };

  const isAdmin = user?.role === "Administrator";

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="rounded-lg p-6">
        <div className="flex items-center mb-6">
          <img
            src={user.picture || "/osa-img.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mr-4"
          />
          <div>
            <h2 className="text-2xl font-semibold">{user.name || "No Name"}</h2>
            <p className="text-lg font-medium text-gray-600 bg-yellow-100 px-2 py-1 rounded inline-block">
              {user.role || "No Role"}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-bold mb-2">User Email</h3>
          <p className="text-gray-600 mb-4">
            <span className="font-medium">{user.email || "No Email"}</span>
          </p>
        </div>

        {isAdmin && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-bold mb-2">
              Email Notification Settings for Borrow Requests
            </h3>

            <input
              type="email"
              value={newNotificationEmail}
              onChange={(e) => setNewNotificationEmail(e.target.value)}
              className="w-full border rounded px-4 py-2 mb-2"
              placeholder="Enter new notification email"
            />
            {message && (
              <p
                className={`text-sm mb-2 ${
                  message.includes("enabled")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}

            <div className="flex items-center mb-4">
              <label className="mr-3 text-sm font-medium text-gray-700">
                Enable Notifications
              </label>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleToggleNotifications}
                className="w-6 h-6 text-blue-600 bg-gray-200 rounded focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>

            <button
              onClick={handleNotificationEmailChange}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Notification Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
