import React, { useState, useEffect, useRef } from 'react';

const EventDialog = ({ showDialog, formData, handleChange, handleSubmit, setShowDialog, isEditing, cancelCreate }) => {
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange({ target: { name: 'image', value: reader.result } });
      };
      reader.readAsDataURL(file);
    }
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

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 rounded-md">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <dialog open className="relative bg-stone-100 p-6 rounded-md shadow-lg z-50 rounded-2xl">
        <h2 className="text-2xl mb-4">New Event</h2>
        <form onSubmit={onSubmit} className="space-y-4 w-96">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div>
            <input
              type="text"
              name="event_name"
              placeholder="Event Name"
              value={formData.event_name}
              onChange={handleChange}
              className="border px-4 py-2 w-full"
              required
            />
          </div>
          <div>
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="border px-4 py-2 w-full"
              required
            />
          </div>
          <div>
            <input
              type="date"
              name="event_date"
              value={formData.event_date}
              onChange={handleChange}
              className="border px-4 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Start Time</label>
            <input
              type="time"
              name="event_start_time"
              value={formData.event_start_time}
              onChange={handleChange}
              className="border px-4 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Event End Time</label>
            <input
              type="time"
              name="event_end_time"
              value={formData.event_end_time}
              onChange={handleChange}
              className="border px-4 py-2 w-full"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Event Location</label>
            <input
              ref={inputRef}
              type="text"
              name="event_location"
              value={formData.event_location || ''}
              onChange={handleLocationChange}
              onFocus={() => setShowDropdown(true)}
              className="border px-4 py-2 w-full"
              placeholder="Type or select a location"
              required
            />
            {showDropdown && (
              <ul ref={dropdownRef} className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-32 overflow-y-auto custom-scrollbar">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full"
            />
            {formData.image && (
              <img src={formData.image} alt="Event" className="mt-2 h-32 w-full object-cover rounded" />
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowDialog(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Event
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default EventDialog;
