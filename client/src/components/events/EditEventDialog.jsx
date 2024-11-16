import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import DeleteEventDialog from './DeleteEventDialog';

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
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

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Edit Event
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="event_name"
              className="block text-sm font-medium text-gray-700"
            >
              Event Name
            </label>
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
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
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
            <label
              htmlFor="event_date"
              className="block text-sm font-medium text-gray-700"
            >
              Event Date
            </label>
            <input
              type="date"
              name="event_date"
              id="event_date"
              value={formatDateForInput(formData.event_date) || ""}
              onChange={handleChange}
              min={today}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="event_start_time"
              className="block text-sm font-medium text-gray-700"
            >
              Event Start Time
            </label>
            <input
              type="time"
              name="event_start_time"
              id="event_start_time"
              value={formData.event_start_time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="event_end_time"
              className="block text-sm font-medium text-gray-700"
            >
              Event End Time
            </label>
            <input
              type="time"
              name="event_end_time"
              id="event_end_time"
              value={formData.event_end_time}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div className="mb-4 relative">
            <label
              htmlFor="event_location"
              className="block text-sm font-medium text-gray-700"
            >
              Event Location
            </label>
            <input
              ref={inputRef}
              type="text"
              name="event_location"
              id="event_location"
              value={formData.event_location || ""}
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
            <label
              htmlFor="event_image"
              className="block text-sm font-medium text-gray-700"
            >
              Event Image
            </label>
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
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={() => setShowDialog(false)}
              className="mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Event
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
