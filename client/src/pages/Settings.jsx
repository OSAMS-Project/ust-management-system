import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faLock, 
  faBell, 
  faPalette, 
  faUsers,
  faSave,
  faWrench
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-hot-toast';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      eventReminders: true
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      language: 'English'
    }
  });

  const handleSave = () => {
    // Implement save functionality here
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header Section - matching the style from UserManagement.jsx */}
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">Settings</h1>
        <FontAwesomeIcon
          icon={faWrench}
          className="text-black text-5xl transform"
        />
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-gray-50 p-6 rounded-l-lg">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                    activeTab === 'profile' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faUser} />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                    activeTab === 'security' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faLock} />
                  <span>Security</span>
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                    activeTab === 'notifications' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faBell} />
                  <span>Notifications</span>
                </button>
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 ${
                    activeTab === 'appearance' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faPalette} />
                  <span>Appearance</span>
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold mb-6">Profile Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        value={settings.profile.name}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, name: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        value={settings.profile.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, email: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                        value={settings.profile.role}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6">
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
