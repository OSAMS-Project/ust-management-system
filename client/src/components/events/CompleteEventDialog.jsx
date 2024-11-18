import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import CompletedExploreModal from "./CompletedExploreEvent";

const CompletedEvents = ({ completedEvents, onEventDeleted }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 15;
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/Events/delete/${eventId}`
      );
      onEventDeleted(eventId);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(
        `Failed to delete event. Error: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  const sortedEvents = [...completedEvents].sort(
    (a, b) => new Date(b.event_date) - new Date(a.event_date)
  );

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="mb-16">
      {sortedEvents.length === 0 ? (
        <p>No completed events to display.</p>
      ) : (
        <>
         <table className="min-w-full bg-white border-collapse">
         <thead className="bg-black text-[#FEC00F]">
              <tr>
                <th className="py-2 px-4 border-b text-center">
                  Event Name
                </th>
                <th className="py-2 px-4 border-b  text-center">
                  Event Date
                </th>
                <th className="py-2 px-4 border-b  text-center">
                  Location
                </th>
                <th className="py-2 px-4 border-b text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.map((event, index) => (
                <tr
                  key={event.unique_id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="py-2 px-4 border-b text-center">
                    {event.event_name}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {new Date(event.event_date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {event.event_location}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => {
                          console.log("Opening modal with event:", event);
                          console.log(
                            "Completed assets:",
                            event.completed_assets
                          );
                          setSelectedEvent(event);
                          setShowExploreModal(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.unique_id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
      <CompletedExploreModal
        showExploreModal={showExploreModal}
        selectedEvent={selectedEvent}
        setShowExploreModal={setShowExploreModal}
      />
    </div>
  );
};

export default CompletedEvents;
