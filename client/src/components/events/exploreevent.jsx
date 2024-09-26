import React from 'react';

const ExploreModal = ({ showExploreModal, selectedEvent, setShowExploreModal }) => {
  if (!showExploreModal || !selectedEvent) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 rounded-md">
      <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowExploreModal(false)}></div>
      <div className="relative bg-white p-6 rounded-md shadow-lg z-50">
        <h2 className="text-2xl mb-4">Event Details</h2>
        <p><strong>Unique ID:</strong> {selectedEvent.unique_id}</p>
        <p><strong>Event Name:</strong> {selectedEvent.event_name}</p>
        <p><strong>Description:</strong> {selectedEvent.description}</p>
        <p><strong>Date:</strong> {new Date(selectedEvent.event_date).toLocaleDateString()}</p>
        <button
          onClick={() => setShowExploreModal(false)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ExploreModal;