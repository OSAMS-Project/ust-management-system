import React, { useState } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import EventDetailsModal from "../events/EventDetailsModal";

const UpcomingEvents = ({ sortedEvents = [], handleEventDetailsClick }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleViewClick = (event) => {
    setSelectedEvent(event);
    if (handleEventDetailsClick) {
      handleEventDetailsClick(event);
    }
  };

  return (
    <div>
      <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full text-lg px-3 py-1 uppercase tracking-wide mb-2">
        Upcoming Events
      </div>
      <div className="p-3 rounded-md">
        {sortedEvents.length === 0 ? ( // Handle case where no events are available
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
                    onClick={() => handleViewClick(event)}
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

      {selectedEvent && (
        <EventDetailsModal
          selectedEvent={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          formatTime={formatTime}
        />
      )}
    </div>
  );
};

export default UpcomingEvents;
