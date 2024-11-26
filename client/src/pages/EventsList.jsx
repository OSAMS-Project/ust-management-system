import { useEffect, useState, useCallback } from "react";
import { gapi } from "gapi-script";
import AddEventButton from "../components/events/AddEventButton";
import EventDialog from "../components/events/EventDialog";
import ExploreModal from "../components/events/ExploreEvent";
import EventCard from "../components/events/EventCard";
import EditEventDialog from "../components/events/EditEventDialog";
import SearchEvent from "../components/events/SearchEvent";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import NotificationPopup from "../components/utils/NotificationsPopup";

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
  const [assets, setAssets] = useState([]);
  const [showCompletedEventsDialog, setShowCompletedEventsDialog] =
    useState(false);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const filteredEvents = data.filter((event) =>
    event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
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
      ...event,
      event_date: event.event_date
    });
    setShowEditDialog(true);
  };
  const [notification, setNotification] = useState(null);
  const showSuccessNotification = (message) => {
    setNotification({
      type: 'success',
      message: message,
    });
    setTimeout(() => setNotification(null), 3000);
  };
  const showErrorNotification = (message) => {
    setNotification({
      type: 'error',
      message: message,
    });
    setTimeout(() => setNotification(null), 3000);
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a new date object with the correct timezone offset
      const eventDate = new Date(formData.event_date);
      const offset = eventDate.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(eventDate.getTime() - offset);
      
      const updatedFormData = {
        ...formData,
        event_date: adjustedDate.toISOString().split('T')[0]
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/Events/update/${formData.unique_id}`,
        updatedFormData
      );

      if (response.status === 200) {
        setData(prevData =>
          prevData.map(event =>
            event.unique_id === formData.unique_id
              ? { ...event, ...updatedFormData }
              : event
          )
        );
        setShowEditDialog(false);
        setNotification({
          type: 'success',
          message: 'Event updated successfully'
        });
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update event'
      });
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
      // Validate event name length
      if (formData.event_name.length > 100) {
        showErrorNotification('Event name must not exceed 100 characters');
        return;
      }
      
      // Validate description length
      if (formData.description.length > 200) {
        showErrorNotification('Description must not exceed 200 characters');
        return;
      }
      // Check if an event with the same name already exists
      const eventExists = data.some(
        event => event.event_name.toLowerCase() === formData.event_name.toLowerCase()
      );

      if (eventExists) {
        showErrorNotification('An event with this name already exists');
        return;
      }

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
        throw new Error('Failed to create event');
      }
      
      const newEvent = await response.json();
      setData((prevData) => [...prevData, newEvent]);
      setFormData({ event_name: "", description: "", event_date: "" });
      setShowDialog(false);
      showSuccessNotification('Event created successfully');
    } catch (err) {
      console.error("Error creating event:", err);
      showErrorNotification('Failed to create event');
    }
  };
  const handleCompleteEvent = async (uniqueId) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/events/${uniqueId}/complete`
      );
      if (response.status === 200) {
        const completedEvent = response.data.updatedEvent;
        setData((prevData) =>
          prevData.filter((event) => event.unique_id !== uniqueId)
        );
        setCompletedEvents((prevCompletedEvents) => [
          ...prevCompletedEvents,
          completedEvent,
        ]);
        const assetResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/Assets/read`
        );
        setAssets(assetResponse.data);
        fetchCompletedEvents();
        setNotification({
          type: 'success',
          message: `Event marked as completed successfully`
        });
      }
    } catch (err) {
      console.error("Error completing event:", err);
      setNotification({
        type: 'error',
        message: `Error completing event: ${err.message}`
      });
    }
  };
  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/Events/delete/${eventId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setData((prevData) => prevData.filter((event) => event.unique_id !== eventId));
      setShowEditDialog(false);
      setEditingEvent(null);
      showSuccessNotification('Event deleted successfully');
    } catch (err) {
      console.error("Error deleting event:", err);
      showErrorNotification('Failed to delete event');
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
        setData((prevData) =>
          prevData.map((e) => {
            if (e.unique_id === event.unique_id) {
              const updatedAssets = e.assets ? [...e.assets] : [];
              selectedAssets.forEach((newAsset) => {
                const existingAssetIndex = updatedAssets.findIndex(
                  (a) => a.asset_id === newAsset.asset_id
                );
                if (existingAssetIndex !== -1) {
                  updatedAssets[existingAssetIndex] = {
                    ...updatedAssets[existingAssetIndex],
                    quantity: updatedAssets[existingAssetIndex].quantity + newAsset.selectedQuantity,
                    cost: parseFloat(newAsset.cost)
                  };
                } else {
                  updatedAssets.push({
                    asset_id: newAsset.asset_id,
                    assetName: newAsset.assetName,
                    quantity: newAsset.selectedQuantity,
                    cost: parseFloat(newAsset.cost)
                  });
                }
              });
              return { ...e, assets: updatedAssets };
            }
            return e;
          })
        );
      }
    } catch (error) {
      console.error("Error adding assets to event:", error);
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
        <div className="w-full mx-auto px-12 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-[1800px] mx-auto">
            {currentEvents.map((item) => (
              <div className="flex justify-center">
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
              </div>
            ))}
            <div className="flex justify-center">
              <AddEventButton onAddEvent={handleAddEvent} />
            </div>
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
      </div>
      {notification && (
        <NotificationPopup
          notification={notification}
          onClose={() => setNotification(null)}
          className="z-50"
        />
      )}
    </div>
  );
}
export default Events;