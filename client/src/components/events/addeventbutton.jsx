import React from "react";

const AddEventButton = ({ onAddEvent }) => {
  return (
    <button
      onClick={onAddEvent}
      className="relative overflow-hidden rounded-lg shadow-lg w-80 h-[32rem] flex flex-col items-center justify-center bg-gray-200 bg-opacity-40 hover:bg-opacity-90 transition duration-300"
    >
      {/* Icon Container */}
      <div className="flex items-center justify-center w-12 h-12 bg-gray-700 text-white rounded-full mb-4">
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z" />
        </svg>
      </div>
      <span className="text-lg font-semibold text-gray-700">Add New Event</span>
    </button>
  );
};

export default AddEventButton;
