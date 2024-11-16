import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import CompletedEventsDialog from "../components/events/CompleteEventDialog";

function CompletedEvents() {
  const [completedEvents, setCompletedEvents] = useState([]);

  const fetchCompletedEvents = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events/completed`
      );
      if (typeof response.data === "string") {
        console.error("Received string instead of JSON:", response.data);
        setCompletedEvents([]);
      } else {
        setCompletedEvents(
          response.data.map((event) => ({
            ...event,
            assets: Array.isArray(event.completed_assets)
              ? event.completed_assets
              : JSON.parse(event.completed_assets || "[]"),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching completed events:", error);
      setCompletedEvents([]);
    }
  };

  useEffect(() => {
    fetchCompletedEvents();
  }, []);

  const handleEventDeleted = (deletedEventId) => {
    setCompletedEvents((prevEvents) =>
      prevEvents.filter((event) => event.unique_id !== deletedEventId)
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">Completed Events</h1>
        <FontAwesomeIcon
          icon={faUsers}
          className="text-black text-5xl transform"
        />
      </div>

      <div className="px-6">
        <CompletedEventsDialog
          completedEvents={completedEvents}
          onEventDeleted={handleEventDeleted}
        />
      </div>
    </div>
  );
}

export default CompletedEvents;
