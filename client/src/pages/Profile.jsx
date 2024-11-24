import React, { useState } from "react";

const ProfilePage = ({ user }) => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  const handleToggleNotifications = () => {
    // Simulate API call to enable/disable notifications
    console.log(
      `Notifications for ${user.email} are now ${
        !isNotificationsEnabled ? "enabled" : "disabled"
      }`
    );
    setIsNotificationsEnabled(!isNotificationsEnabled);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Profile Section */}
        <div className="flex items-center mb-6">
          <img
            src={user.picture || "https://via.placeholder.com/100"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mr-4"
          />
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-lg font-medium text-gray-600 bg-yellow-100 px-2 py-1 rounded inline-block">
              {user.role}
            </p>
          </div>
        </div>

        {/* Notification Email Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-bold mb-2">Email Notifications</h3>
          <p className="text-gray-600 mb-4">
            Notifications will be sent to:{" "}
            <span className="font-medium">{user.email}</span>
          </p>
          <button
            onClick={handleToggleNotifications}
            className={`px-4 py-2 rounded transition ${
              isNotificationsEnabled
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isNotificationsEnabled ? "Turn Off Notifications" : "Turn On Notifications"}
          </button>
          {isNotificationsEnabled && (
            <p className="mt-2 text-green-600 font-medium">
              Notifications are enabled for your email.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
