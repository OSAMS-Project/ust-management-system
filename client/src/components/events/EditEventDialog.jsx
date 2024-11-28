import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import DeleteEventDialog from './DeleteEventDialog';

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const phDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const year = phDate.getFullYear();
  const month = String(phDate.getMonth() + 1).padStart(2, '0');
  const day = String(phDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const EditEventDialog = ({
  showDialog,
  formData,
  handleChange,
  handleSubmit,
  setShowDialog,
  handleDelete,
}) => {
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (showDialog && formData && formData.event_location) {
      setFilteredLocations(
        locationOptions.filter((location) =>
          location.toLowerCase().includes(formData.event_location.toLowerCase())
        )
      );
    } else {
      setFilteredLocations(locationOptions);
    }
  }, [showDialog, formData, locationOptions]);

  const handleLocationChange = (e) => {
    handleChange(e);
    setShowDropdown(true);
    setFilteredLocations(
      locationOptions.filter((location) =>
        location.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  const selectLocation = (location) => {
    handleChange({ target: { name: "event_location", value: location } });
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDialog]);

  const now = new Date();
  const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  const year = phTime.getFullYear();
  const month = String(phTime.getMonth() + 1).padStart(2, '0');
  const day = String(phTime.getDate()).padStart(2, '0');
  const formattedToday = `${year}-${month}-${day}`;

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const phNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    
    selectedDate.setHours(0, 0, 0, 0);
    phNow.setHours(0, 0, 0, 0);

    if (selectedDate < phNow) {
      toast.error('Cannot select a past date');
      return;
    }

    handleChange(e);
  };

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto transform transition-all animate-fadeIn font-roboto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Edit Event</h2>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Name */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name</label>
                <input
                  type="text"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  required
                  placeholder="Enter event name"
                />
              </div>

              {/* Description */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter event description"
                  required
                />
              </div>

              {/* Event Date */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date</label>
                <input
                  type="date"
                  name="event_date"
                  value={formatDateForInput(formData.event_date) || ""}
                  onChange={handleDateChange}
                  min={formattedToday}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Event Times */}
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Time</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="time"
                    name="event_start_time"
                    value={formData.event_start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    required
                  />
                  <input
                    type="time"
                    name="event_end_time"
                    value={formData.event_end_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Location</label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    name="event_location"
                    value={formData.event_location || ""}
                    onChange={handleLocationChange}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    placeholder="Type or select a location"
                    required
                  />
                  {showDropdown && (
                    <ul
                      ref={dropdownRef}
                      className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-32 overflow-y-auto rounded-lg shadow-lg"
                    >
                      {filteredLocations.map((location, index) => (
                        <li
                          key={index}
                          onClick={() => selectLocation(location)}
                          className="px-4 py-2 hover:bg-yellow-50 cursor-pointer text-sm"
                        >
                          {location}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Image Upload with Size Limit Label */}
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
                  {error && (
                    <p className="mt-1 text-sm text-red-500">
                      {error}
                    </p>
                  )}
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
            <div className="flex justify-between gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => handleDelete(formData.unique_id)}
                className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                Delete
              </button>
              <div className="flex gap-4">
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
                  {isSubmitting ? 'Updating...' : 'Update Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <DeleteEventDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          handleDelete(formData.unique_id);
          setShowDeleteConfirm(false);
          setShowDialog(false);
        }}
        eventName={formData.event_name}
      />
    </div>
  );
}

export default EditEventDialog;
