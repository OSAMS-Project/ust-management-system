import React, { useState } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import ExploreModal from "../events/ExploreEvent";
import axios from "axios";

const UpcomingEvents = ({ sortedEvents = [] }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showExploreModal, setShowExploreModal] = useState(false);

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleExplore = async (event) => {
    try {
      // Log the URL being called
      const url = `${process.env.REACT_APP_API_URL}/api/events/${event.unique_id}`;
      console.log('Calling API URL:', url);

      const response = await axios.get(url);
      console.log('Raw response:', response); // Debug log
      
      const eventWithAssets = response.data;
      console.log('Fetched event data:', eventWithAssets);
      
      if (!eventWithAssets.assets) {
        eventWithAssets.assets = [];
      }
      
      setSelectedEvent(eventWithAssets);
      setShowExploreModal(true);
    } catch (error) {
      console.error('Error fetching event details:', error);
      console.error('Error response:', error.response); // Log the full error response
      alert('Failed to load event details. Please check the console for more information.');
    }
  };

  return (
    <div>
      <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full text-lg px-3 py-1 uppercase tracking-wide mb-2">
        Upcoming Events
      </div>
      <div className="p-3 rounded-md">
        {sortedEvents.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming events yet</p>
        ) : (
          sortedEvents.slice(0, 3).map((event, index) => (
            <div
              key={event.unique_id}
              className={`py-1 ${
                index < sortedEvents.slice(0, 3).length - 1 ? "border-b" : ""
              } border-gray-200`}
            >
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-black text-lg"
                />
                <div className="flex justify-between items-center w-full">
                  <div>
                    <p className="text-xs text-gray-400">
                      {moment(event.event_date).format("MMM D, YYYY")}{" "}
                      {formatTime(event.event_start_time)} -{" "}
                      {formatTime(event.event_end_time)}
                    </p>
                    <p className="font-bold text-md">{event.event_name}</p>
                    <p className="text-xs text-gray-500 mb-1">
                      {event.description}
                    </p>
                  </div>
                  <button
                    className="bg-black text-white px-2 py-0.5 rounded-full flex items-center"
                    onClick={() => handleExplore(event)}
                  >
                    <FontAwesomeIcon icon={faEye} className="mr-1 text-xs" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedEvent && showExploreModal && (
        <ExploreModal
          showExploreModal={showExploreModal}
          setShowExploreModal={setShowExploreModal}
          selectedEvent={selectedEvent}
          handleAddAsset={() => {}}
          updateEventAssets={() => {}}
          updateAssetQuantity={() => {}}
          readOnly={true}
        />
      )}
    </div>
  );
};

export default UpcomingEvents;
