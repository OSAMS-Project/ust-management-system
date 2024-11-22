import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import NotificationPopup from '../components/utils/NotificationsPopup';

function Settings() {
  const [terms, setTerms] = useState({
    borrowingGuidelines: '',
    documentationRequirements: '',
    usagePolicy: ''
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/terms-and-conditions');
        if (response.data) {
          setTerms({
            borrowingGuidelines: response.data.borrowing_guidelines.join('\n'),
            documentationRequirements: response.data.documentation_requirements.join('\n'),
            usagePolicy: response.data.usage_policy.join('\n')
          });
        }
      } catch (error) {
        console.error('Error fetching terms:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load terms'
        });
      }
    };

    fetchTerms();
  }, []);

  const handleSave = async () => {
    try {
      const formattedTerms = {
        borrowing_guidelines: terms.borrowingGuidelines.split('\n').filter(line => line.trim() !== ''),
        documentation_requirements: terms.documentationRequirements.split('\n').filter(line => line.trim() !== ''),
        usage_policy: terms.usagePolicy.split('\n').filter(line => line.trim() !== '')
      };

      // Get current terms from the database
      const currentTerms = await axios.get('http://localhost:5000/api/terms-and-conditions');
      
      // Check if the data is identical
      const isIdentical = 
        JSON.stringify(currentTerms.data.borrowing_guidelines) === JSON.stringify(formattedTerms.borrowing_guidelines) &&
        JSON.stringify(currentTerms.data.documentation_requirements) === JSON.stringify(formattedTerms.documentation_requirements) &&
        JSON.stringify(currentTerms.data.usage_policy) === JSON.stringify(formattedTerms.usage_policy);

      if (isIdentical) {
        setNotification({
          type: 'info',
          message: 'No changes detected to save'
        });
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      // If data is different, proceed with the update
      await axios.put('http://localhost:5000/api/terms-and-conditions', formattedTerms);
      
      setNotification({
        type: 'success',
        message: 'Terms and conditions updated successfully'
      });
      setTimeout(() => setNotification(null), 3000);

    } catch (error) {
      console.error('Error saving settings:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update terms and conditions'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-semibold mb-6">Terms and Conditions Settings</h3>
        
        {/* Borrowing Guidelines */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4">1. Borrowing Guidelines</h4>
          <textarea
            value={terms.borrowingGuidelines}
            onChange={(e) => setTerms({ ...terms, borrowingGuidelines: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md min-h-[150px]"
            placeholder="Enter each guideline on a new line"
          />
        </div>

        {/* Documentation Requirements */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4">2. Documentation Requirements</h4>
          <textarea
            value={terms.documentationRequirements}
            onChange={(e) => setTerms({ ...terms, documentationRequirements: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md min-h-[150px]"
            placeholder="Enter each requirement on a new line"
          />
        </div>

        {/* Usage Policy */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4">3. Usage Policy</h4>
          <textarea
            value={terms.usagePolicy}
            onChange={(e) => setTerms({ ...terms, usagePolicy: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md min-h-[150px]"
            placeholder="Enter each policy on a new line"
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faSave} />
          Save Changes
        </button>
      </div>

      {/* Add notification popup */}
      {notification && (
        <NotificationPopup
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default Settings;
