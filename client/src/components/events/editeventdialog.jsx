import React, { useEffect, useState, useRef } from 'react';

function EditEventDialog({ showDialog, formData, handleChange, handleSubmit, setShowDialog }) {
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
  const imageInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (showDialog && formData && formData.event_location) {
      setFilteredLocations(
        locationOptions.filter(location => 
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
      locationOptions.filter(location => 
        location.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
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
    // Add click event listener to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDialog, formData, locationOptions]);

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Edit Event</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="event_name" className="block text-sm font-medium text-gray-700">Event Name</label>
            <input
              type="text"
              name="event_name"
              id="event_name"
              value={formData.event_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">Event Date</label>
            <input
              type="date"
              name="event_date"
              id="event_date"
              value={formData.event_date || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="event_start_time" className="block text-sm font-medium text-gray-700">Event Start Time</label>
            <input
              type="time"
              name="event_start_time"
              id="event_start_time"
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="event_end_time" className="block text-sm font-medium text-gray-700">Event End Time</label>
            <input
              type="time"
              name="event_end_time"
              id="event_end_time"
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4 relative">
            <label htmlFor="event_location" className="block text-sm font-medium text-gray-700">Event Location</label>
            <input
              ref={inputRef}
              type="text"
              name="event_location"
              id="event_location"
              value={formData.event_location || ''}
              onChange={handleLocationChange}
              onFocus={() => setShowDropdown(true)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Type or select a location"
              required
            />
            {showDropdown && (
              <ul 
                ref={dropdownRef}
                className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-32 overflow-y-auto custom-scrollbar"
              >
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
          <div className="mb-4">
            <label htmlFor="event_image" className="block text-sm font-medium text-gray-700">Event Image</label>
            <input
              type="file"
              id="event_image"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {formData.image && (
              <div className="mt-2">
                <img 
                  src={formData.image} 
                  alt="Event" 
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowDialog(false)}
              className="mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEventDialog;