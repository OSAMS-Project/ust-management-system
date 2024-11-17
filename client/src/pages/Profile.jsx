import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const ProfilePage = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    // Here you would typically send the updated data to your server
    console.log('Saving user data:', { name, role });
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    // Reset the fields to original user data
    setName(user.name);
    setRole(user.role);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center mb-4">
          <img src={user.picture || "https://via.placeholder.com/100"} alt="Profile" className="w-24 h-24 rounded-full object-cover mr-4" />
          <div>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-300 rounded p-2 mb-2"
                />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="border border-gray-300 rounded p-2 mb-2"
                />
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">{name}</h2>
                <p className="text-gray-600">{role}</p>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex justify-end">
            <button onClick={handleSaveClick} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
              <FontAwesomeIcon icon={faSave} className="mr-1" /> Save
            </button>
            <button onClick={handleCancelClick} className="bg-red-500 text-white px-4 py-2 rounded">
              <FontAwesomeIcon icon={faTimes} className="mr-1" /> Cancel
            </button>
          </div>
        ) : (
          <button onClick={handleEditClick} className="bg-blue-500 text-white px-4 py-2 rounded">
            <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit Profile
          </button>
        )}
      </div>

    
    </div>
  );
};

export default ProfilePage;