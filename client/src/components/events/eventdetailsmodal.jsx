import React from 'react';

const EventDetailsModal = ({ selectedEvent, onClose, formatTime }) => {
  if (!selectedEvent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 overflow-y-auto h-full w-full z-50 flex items-center justify-center px-4">
      <div className="relative w-full max-w-lg p-8 border shadow-xl rounded-lg bg-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gray-200 hover:bg-gray-300 rounded-full p-2 text-gray-600 transition-all"
          aria-label="Close"
        >
          ✕
        </button>
        
        {/* Modal Header */}
        <h2 className="text-3xl mb-6 font-semibold text-gray-800 border-b pb-3">
          Event Details
        </h2>
        
        {/* Event Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Event Name:</span>
            <span className="text-gray-600">{selectedEvent.event_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Description:</span>
            <span className="text-gray-600">{selectedEvent.description}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Date:</span>
            <span className="text-gray-600">{new Date(selectedEvent.event_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Start Time:</span>
            <span className="text-gray-600">{formatTime(selectedEvent.event_start_time)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">End Time:</span>
            <span className="text-gray-600">{formatTime(selectedEvent.event_end_time)}</span>
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-8 w-full bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition duration-200 shadow-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EventDetailsModal;
