import React, { useState, useEffect, useRef } from 'react';

const EventDialog = ({ showDialog, formData, handleChange, handleSubmit, setShowDialog, isEditing, cancelCreate }) => {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationOptions] = useState([
    'Online', 'Off-campus', 'In-campus',
    'Arch of the Centuries', 'Benavides Auditorium', 'Benavides Garden',
    'Bl. Buenaventura G. Paredes, O.P. Building Lobby',
    'Bl. Buenaventura G. Paredes, O.P. Building Mezzanine',
    'Central Laboratory Auditorium [W]',
    'Central Laboratory Auditorium - A [P]',
    'Central Laboratory Auditorium - B [P]',
    'Civil Law Auditorium', 'Civil Law Lobby', 'Covered Walk',
    'Dr. Robert C. Sy Grand Ballroom', 'Education Auditorium',
    'Engineering Conference Hall', 'Frassati Auditorium',
    'Frassati Pre-Function Area', 'Gazebo (in front of Medicine Bldg.)',
    'George S.K. Ty Function Hall [W]', 'George S.K. Ty Function Hall - 402 [P]',
    'George S.K. Ty Function Hall - 403 [P]', 'George S.K. Ty Function Hall - 404 [P]',
    'George S.K. Ty Function Hall - 4A [P]', 'George S.K. Ty Function Hall - 4B [P]',
    'George S.K. Ty Function Hall - 4C [P]',
    'George S.K. Ty Function Hall - A (402-404) [W/P]',
    'George S.K. Ty Function Hall - B (4ABC) [W/P]',
    'Main Building Lobby', 'Medicine Auditorium',
    'Museum Gallery/Main Hall', 'Museum Interior Courts (Left/Right)',
    'P. Noval Covered Court', 'Plaza Mayor', 'Practice Gym - A [P]',
    'Practice Gym - ABCD [W]', 'Practice Gym - B [P]', 'Practice Gym - C [P]',
    'Practice Gym - D [P]', 'Quadricentennial Pavilion Arena',
    'Quadricentennial Square', 'TARC Auditorium', 'UST Field [W]',
    'UST Field - Beato Angelico Side [P]',
    'UST Field - Front of the Grandstand Stage [P]',
    'UST Field - Grandstand [P]', 'UST Grounds', 'UST Parade Grounds'
  ]);
  const [filteredLocations, setFilteredLocations] = useState(locationOptions);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Get current date in Philippine timezone
  const now = new Date();
  const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const year = phTime.getFullYear();
  const month = String(phTime.getMonth() + 1).padStart(2, '0');
  const day = String(phTime.getDate()).padStart(2, '0');
  const formattedToday = `${year}-${month}-${day}`;

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const phNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    
    // Reset hours to compare just the dates
    selectedDate.setHours(0, 0, 0, 0);
    phNow.setHours(0, 0, 0, 0);

    if (selectedDate < phNow) {
      setError('Cannot select a past date');
      return;
    }

    setError('');
    handleChange(e);
  };

  useEffect(() => {
    if (formData.event_location) {
      setFilteredLocations(
        locationOptions.filter(location => 
          location.toLowerCase().includes(formData.event_location.toLowerCase())
        )
      );
    } else {
      setFilteredLocations(locationOptions);
    }
  }, [formData.event_location, locationOptions]);

  const handleLocationChange = (e) => {
    handleChange(e);
    setShowDropdown(true);
  };

  const selectLocation = (location) => {
    handleChange({ target: { name: 'event_location', value: location } });
    setShowDropdown(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    // Check if a file was selected
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG and PNG images are allowed');
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange({ target: { name: 'image', value: reader.result } });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && inputRef.current &&
          !dropdownRef.current.contains(event.target) &&
          !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [formData.event_location, locationOptions]);

  // Add this new function to validate time
  const validateTime = (e) => {
    const { name, value } = e.target;
    const startTime = name === 'event_start_time' ? value : formData.event_start_time;
    const endTime = name === 'event_end_time' ? value : formData.event_end_time;

    // Only validate if both times are set
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);

      if (end <= start) {
        setError('End time must be later than start time');
        return false;
      }
    }

    setError('');
    handleChange(e);
    return true;
  };

  // Modify the form submission to include time validation
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Validate times before submitting
    const start = new Date(`2000-01-01T${formData.event_start_time}`);
    const end = new Date(`2000-01-01T${formData.event_end_time}`);

    if (end <= start) {
      setError('End time must be later than start time');
      return;
    }

    handleSubmit(e);
  };

  if (!showDialog) return null;

  return (
    <div className={`fixed inset-0 z-50 ${showDialog ? '' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <form onSubmit={handleFormSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Name */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name *</label>
                <input
                  type="text"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  placeholder="Enter event name"
                />
              </div>

              {/* Description */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter event description"
                  required
                />
              </div>

              {/* Event Date */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date *</label>
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date || ''}
                  onChange={handleDateChange}
                  min={formattedToday}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Event Time - Only show error here */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Time *</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="time"
                    name="event_start_time"
                    value={formData.event_start_time}
                    onChange={validateTime}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <input
                    type="time"
                    name="event_end_time"
                    value={formData.event_end_time}
                    onChange={validateTime}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                {/* Only error display */}
                {error && (
                  <div className="text-red-500 text-sm mt-1">{error}</div>
                )}
              </div>

              {/* Location */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Location *</label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    name="event_location"
                    value={formData.event_location || ''}
                    onChange={handleLocationChange}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Type or select a location"
                    required
                  />
                  {showDropdown && (
                    <ul ref={dropdownRef} className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-32 overflow-y-auto rounded-lg shadow-lg">
                      {filteredLocations.map((location, index) => (
                        <li 
                          key={index}
                          onClick={() => selectLocation(location)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {location}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Image
                  <span className="text-red-500 ml-1">*</span>
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Maximum size: 1MB)
                  </span>
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Accepted formats: JPG, PNG only (max. 1MB)
                  </p>
                </div>
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Event preview" 
                      className="h-32 w-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventDialog;
