import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import CompletedEventsDialog from "../components/events/CompleteEventDialog";
import CompletedEventsControls from "../components/events/CompletedEventsControls";

function CompletedEvents() {
  const [completedEvents, setCompletedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

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

  // Get unique locations for the filter dropdown
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(completedEvents.map(event => event.event_location))];
    return uniqueLocations.sort();
  }, [completedEvents]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = [...completedEvents];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.event_name.toLowerCase().includes(searchLower) ||
          event.event_location.toLowerCase().includes(searchLower)
      );
    }

    // Apply date filter
    if (filterDate) {
      const filterDateStr = new Date(filterDate).toDateString();
      filtered = filtered.filter(
        event => new Date(event.event_date).toDateString() === filterDateStr
      );
    }

    // Apply location filter
    if (filterLocation) {
      filtered = filtered.filter(
        event => event.event_location === filterLocation
      );
    }

    return filtered;
  }, [completedEvents, searchTerm, filterDate, filterLocation]);

  return (
    <div className="space-y-6">
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">Completed Events</h1>
        <FontAwesomeIcon
          icon={faClipboardList}
          className="text-black text-5xl transform"
        />
      </div>

      <div className="px-6">
        <CompletedEventsControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          filterLocation={filterLocation}
          setFilterLocation={setFilterLocation}
          locations={locations}
        />
        <CompletedEventsDialog completedEvents={filteredEvents} />
      </div>
    </div>
  );
}

export default CompletedEvents;
