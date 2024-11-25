import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage = ({ user }) => {
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    const fetchUpdatedUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/${user.id}`
        );
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch updated user:", error);
      }
    };

    // Fetch the latest user data on component mount
    fetchUpdatedUser();

    // Set up an event listener for role updates
    const handleRoleUpdate = () => {
      fetchUpdatedUser();
    };

    window.addEventListener("roleUpdate", handleRoleUpdate);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("roleUpdate", handleRoleUpdate);
    };
  }, [user.id]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="rounded-lg p-6">
        {/* Profile Section */}
        <div className="flex items-center mb-6">
          <img
            src={currentUser.picture || "/osa-img.png"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mr-4"
          />
          <div>
            <h2 className="text-2xl font-semibold">{currentUser.name}</h2>
            <p className="text-lg font-medium text-gray-600 bg-yellow-100 px-2 py-1 rounded inline-block">
              {currentUser.role || "No Role"}
            </p>
          </div>
        </div>

        {/* User Email Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-bold mb-2">User Email</h3>
          <p className="text-gray-600 mb-4">
            <span className="font-medium">{currentUser.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
