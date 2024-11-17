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
    "Online",
    "Off-campus",
    "In-campus",
    "Arch of the Centuries",
    "Benavides Auditorium",
    "Benavides Garden",
    "Bl. Buenaventura G. Paredes, O.P. Building Lobby",
    // Additional locations...
    "UST Grounds",
    "UST Parade Grounds",
  ]);
  const [filteredLocations, setFilteredLocations] = useState(locationOptions);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const today = new Date().toISOString().split('T')[0];

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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange({ target: { name: "image", value: reader.result } });
      };
      reader.readAsDataURL(file);
    }
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
            <button
              onClick={() => setShowDialog(false)}
              className="text-black hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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

              {/* Image Upload */}
              <div className="form-group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-yellow-50 file:text-yellow-700
                    hover:file:bg-yellow-100
                    transition-all"
                />
                {formData.image && (
                  <img src={formData.image} alt="Event" className="mt-2 h-32 w-full object-cover rounded-lg" />
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
              >
                Update
              </button>
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
