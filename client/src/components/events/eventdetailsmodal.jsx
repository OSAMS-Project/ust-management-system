import React from 'react';

const EventDetailsModal = ({ selectedEvent, onClose, formatTime }) => {
  if (!selectedEvent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center px-4 py-6">
      <div className="relative w-full max-w-xl p-8 border shadow-2xl rounded-2xl bg-white transform transition-all duration-300 ease-in-out scale-100 sm:scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-300 hover:bg-gray-400 rounded-full p-2 text-gray-700 hover:text-gray-900 transition duration-200 focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Modal Header */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3 text-center">
          Event Details
        </h2>

        {/* Event Information */}
        <div className="space-y-5">
          <div className="flex items-start">
            <span className="font-semibold text-gray-700 w-32">Event Name:</span>
            <span className="text-gray-600">{selectedEvent.event_name}</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold text-gray-700 w-32">Description:</span>
            <span className="text-gray-600">{selectedEvent.description}</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold text-gray-700 w-32">Date:</span>
            <span className="text-gray-600">{new Date(selectedEvent.event_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold text-gray-700 w-32">Start Time:</span>
            <span className="text-gray-600">{formatTime(selectedEvent.event_start_time)}</span>
          </div>
          <div className="flex items-start">
            <span className="font-semibold text-gray-700 w-32">End Time:</span>
            <span className="text-gray-600">{formatTime(selectedEvent.event_end_time)}</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-8 w-full bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EventDetailsModal;
