import { useEffect, useState, useCallback } from "react";
import { gapi } from "gapi-script";
import AddEventButton from "../components/events/addeventbutton";
import EventDialog from "../components/events/eventdialog";
import ExploreModal from "../components/events/exploreevent";
import EventCard from "../components/events/eventcard";
import EditEventDialog from "../components/events/editeventdialog";
import SearchEvent from "../components/events/searchevent";
import axios from "axios";
import CompletedEvents from "../components/events/completeeventdialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const date = new Date(2000, 0, 1, hours, minutes);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function Events() {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    event_date: "",
    event_start_time: "",
    event_end_time: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assets, setAssets] = useState([]); // Add this line
  const [showCompletedEventsDialog, setShowCompletedEventsDialog] =
    useState(false);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = data.slice(indexOfFirstEvent, indexOfLastEvent);

  const totalPages = Math.ceil(data.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEventDeleted = (deletedEventId) => {
    setCompletedEvents((prevEvents) =>
      prevEvents.filter((event) => event.unique_id !== deletedEventId)
    );
  };

  const fetchCompletedEvents = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events/completed`
      );
      console.log("Raw response data:", response.data);
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
      if (error instanceof SyntaxError) {
        console.error("Invalid JSON received:", error.message);
      }
      setCompletedEvents([]);
    }
  };

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: "",
      });
    }

    gapi.load("client:auth2", start);

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/Events/read`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAssets = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/Assets/read`
        );
        setAssets(response.data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchData();
    fetchAssets();
    fetchCompletedEvents();
  }, []);

  useEffect(() => {
    if (showCompletedEventsDialog) {
      fetchCompletedEvents();
    }
  }, [showCompletedEventsDialog]);

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      unique_id: event.unique_id,
      event_name: event.event_name,
      description: event.description,
      event_date: event.event_date.split('T')[0],
      event_location: event.event_location,
      event_start_time: event.event_start_time,
      event_end_time: event.event_end_time,
      image: event.image || '/ust-image.JPG'
    });
    setShowEditDialog(true);
  };

  const filteredEvents = data.filter((event) =>
    event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedFormData = { ...formData };
      
      if (updatedFormData.image === '/ust-image.JPG') {
        delete updatedFormData.image;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/Events/update/${editingEvent.unique_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedFormData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      const updatedEvent = await response.json();

      setData((prevData) =>
        prevData.map((event) =>
          event.unique_id === editingEvent.unique_id ? updatedEvent : event
        )
      );

      setShowEditDialog(false);
      setEditingEvent(null);
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  const handleChange = (e, eventId = null) => {
    const { name, value } = e.target;
    if (eventId) {
      setData((prevData) =>
        prevData.map((event) =>
          event.unique_id === eventId ? { ...event, [name]: value } : event
        )
      );
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/Events/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create event");
      }

      const newEvent = await response.json();
      setData((prevData) => [...prevData, newEvent]);
      setFormData({ event_name: "", description: "", event_date: "" });
      setShowDialog(false);
    } catch (err) {
      console.error("Error creating event:", err);
      alert(`Error creating event: ${err.message}`);
    }
  };

  const handleCompleteEvent = async (uniqueId) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/events/${uniqueId}/complete`
      );
      if (response.status === 200) {
        const completedEvent = response.data.updatedEvent;

        // Remove the completed event from the main list
        setData((prevData) =>
          prevData.filter((event) => event.unique_id !== uniqueId)
        );

        // Immediately add the completed event to the completedEvents list
        setCompletedEvents((prevCompletedEvents) => [
          ...prevCompletedEvents,
          completedEvent,
        ]);

        console.log(`Event with ID ${uniqueId} marked as completed`);

        // Fetch updated asset list
        const assetResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/Assets/read`
        );
        setAssets(assetResponse.data);

        // Fetch all completed events to ensure consistency
        fetchCompletedEvents();
      }
    } catch (err) {
      console.error("Error completing event:", err);
      alert(`Error completing event: ${err.message}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/Events/delete/${eventId}`
      );
      // Update local state after successful deletion
      setData((prevData) =>
        prevData.filter((event) => event.unique_id !== eventId)
      );
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleExplore = async (event) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events/${event.unique_id}`
      );
      if (response.data) {
        setSelectedEvent(response.data);
        setShowExploreModal(true);
      } else {
        console.error("No event data received");
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      // You might want to show an error message to the user here
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
  };

  const cancelEdit = () => {
    setShowEditDialog(false);
    setFormData({ event_name: "", description: "", event_date: "" });
  };

  const cancelCreate = () => {
    setShowDialog(false);
    setFormData({ event_name: "", description: "", event_date: "" });
  };

  const handleAddAsset = async (event, selectedAssets) => {
    try {
      console.log(`Adding assets to event ${event.unique_id}:`, selectedAssets);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/events/${event.unique_id}/addAssets`,
        {
          assets: selectedAssets,
        }
      );

      if (response.data.success) {
        // Update the local state
        setData((prevData) =>
          prevData.map((e) => {
            if (e.unique_id === event.unique_id) {
              const updatedAssets = e.assets ? [...e.assets] : [];
              selectedAssets.forEach((newAsset) => {
                const existingAssetIndex = updatedAssets.findIndex(
                  (a) => a.asset_id === newAsset.asset_id
                );
                if (existingAssetIndex !== -1) {
                  // Asset already exists, update its quantity
                  updatedAssets[existingAssetIndex].quantity +=
                    newAsset.selectedQuantity;
                } else {
                  // Asset doesn't exist, add it to the list
                  updatedAssets.push({
                    ...newAsset,
                    quantity: newAsset.selectedQuantity,
                  });
                }
              });
              return { ...e, assets: updatedAssets };
            }
            return e;
          })
        );
        console.log(`Assets successfully added to event ${event.event_name}`);
      }
    } catch (error) {
      console.error("Error adding assets to event:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
    }
  };

  const updateEventAssets = (eventId, updatedAssets) => {
    setData((prevData) =>
      prevData.map((event) =>
        event.unique_id === eventId
          ? { ...event, assets: updatedAssets }
          : event
      )
    );
    setSelectedEvent((prevEvent) =>
      prevEvent && prevEvent.unique_id === eventId
        ? { ...prevEvent, assets: updatedAssets }
        : prevEvent
    );
  };

  const updateAssetQuantity = useCallback(async (assetId, newQuantity) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/Assets/updateQuantity/${assetId}`,
        {
          quantity: newQuantity,
        }
      );
      if (response.data.success) {
        setAssets((prevAssets) =>
          prevAssets.map((asset) =>
            asset.asset_id === assetId
              ? { ...asset, quantity: newQuantity }
              : asset
          )
        );
      } else {
        throw new Error(
          response.data.message || "Failed to update asset quantity"
        );
      }
    } catch (error) {
      console.error("Error updating asset quantity:", error);
      alert(
        `Error updating asset quantity: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  const handleAddEvent = () => {
    setFormData({ event_name: "", description: "", event_date: "" });
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">
          Events Management
        </h1>
        <FontAwesomeIcon
          icon={faUsers}
          className="text-black text-5xl transform"
        />
      </div>

      <div className="flex flex-col items-center justify-center">
        <SearchEvent searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <EventDialog
          showDialog={showDialog}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setShowDialog={setShowDialog}
          isEditing={!!editingEvent}
          cancelCreate={cancelCreate}
        />

        <ExploreModal
          showExploreModal={showExploreModal}
          selectedEvent={selectedEvent}
          setShowExploreModal={setShowExploreModal}
          handleAddAsset={handleAddAsset}
          updateEventAssets={updateEventAssets}
          updateAssetQuantity={updateAssetQuantity}
          setSelectedEvent={setSelectedEvent}
        />

        <EditEventDialog
          showDialog={showEditDialog}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleEditSubmit}
          setShowDialog={setShowEditDialog}
          handleDelete={handleDeleteEvent}
        />

        <div className="w-82 mx-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {currentEvents.map((item) => (
              <EventCard
                key={item.unique_id}
                item={item}
                handleExplore={handleExplore}
                handleComplete={handleCompleteEvent}
                handleEdit={handleEdit}
                formatTime={formatTime}
                handleAddAsset={handleAddAsset}
                assets={assets}
              />
            ))}
            <AddEventButton onAddEvent={handleAddEvent} /> {/* Add Button */}
          </div>
          <div className="mt-4 mb-8 flex justify-center">
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
        </div>

        <CompletedEvents
          completedEvents={completedEvents}
          onEventDeleted={handleEventDeleted}
        />
      </div>
    </div>
  );
}

export default Events;
