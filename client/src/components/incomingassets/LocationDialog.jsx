import React from 'react';

const LocationDialog = ({ 
  showLocationDialog, 
  setShowLocationDialog, 
  selectedLocation, 
  setSelectedLocation, 
  locations, 
  handleLocationSubmit 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all animate-fadeIn font-roboto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Select Storage Location</h2>
            <button
              onClick={() => setShowLocationDialog(false)}
              className="text-black hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleLocationSubmit} className="space-y-6">
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Storage Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a location</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowLocationDialog(false);
                  setSelectedLocation('');
                }}
                className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LocationDialog;
