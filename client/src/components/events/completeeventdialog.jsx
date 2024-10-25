import React, { useState } from 'react';
import axios from 'axios';

const CompletedEvents = ({ completedEvents, onEventDeleted }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 4;

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/Events/delete/${eventId}`);
      onEventDeleted(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`Failed to delete event. Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const sortedEvents = [...completedEvents].sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="mt-8 mb-16">
      <h2 className="text-2xl font-bold mb-4">Completed Events</h2>
      {sortedEvents.length === 0 ? (
        <p>No completed events to display.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-4">
            {currentEvents.map(event => (
              <div key={event.unique_id} className="bg-gray-100 p-4 rounded-lg w-64">
                <div className="flex flex-col mb-2">
                  <h3 className="text-lg font-semibold">{event.event_name}</h3>
                  <span className="text-sm text-gray-600">Event Date: {new Date(event.event_date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">Location: {event.event_location}</p>
                <h4 className="font-medium mb-2">Assets Used:</h4>
                {event.assets && event.assets.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {event.assets.map((asset, index) => (
                      <li key={index} className="text-sm">
                        {asset.assetName}: {asset.quantity}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No assets used for this event.</p>
                )}
                <button
                  onClick={() => handleDeleteEvent(event.unique_id)}
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Delete Event
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === i + 1 ? 'bg-yellow-500 text-white' : 'bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CompletedEvents;
