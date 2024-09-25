import { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import './eventlist1.css';
import AddEventButton from '../components/events/addeventbutton';
import EventDialog from '../components/events/eventdialog';
import ExploreModal from '../components/events/exploreevent';
import EventCard from '../components/events/eventcard';
import EditEventDialog from '../components/events/editeventdialog'; // New component

const clientId =
  "1072140054426-iucuc7c784kr4bvat2nkv8mvd865005s.apps.googleusercontent.com";

function Events() {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    event_date: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Reintroduce state for confirmation dialog

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: "",
      });
    }

    gapi.load("client:auth2", start);

    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/Events/read");
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

    fetchData();
  }, []);

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      event_name: event.event_name,
      description: event.description,
      event_date: event.event_date,
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/Events/update/${editingEvent.unique_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      const updatedEvent = await response.json();
      
      setData((prevData) =>
        prevData.map((event) =>
          event.unique_id === editingEvent.unique_id ? updatedEvent : event
        )
      );

      setFormData({ event_name: "", description: "", event_date: "" });
      setShowEditDialog(false);
      setEditingEvent(null);
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  // Handle form input change
  const handleChange = (e, eventId = null) => {
    const { name, value } = e.target;
    if (eventId) {
      setData(prevData =>
        prevData.map(event =>
          event.unique_id === eventId
            ? { ...event, [name]: value }
            : event
        )
      );
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/Events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const newEvent = await response.json();
      setData((prevData) => [...prevData, newEvent]); // Add new event to the existing list
      setFormData({ event_name: "", description: "", event_date: "" }); // Reset form fields
      setShowDialog(false); // Close the dialog after submission
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  // Handle delete button click
  const handleDelete = async (uniqueId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/delete/${uniqueId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete event: ${errorText}`);
      }

      const result = await response.json();
      setData(result.updatedEvents); // Update the state with the updated events
      console.log(`Event with ID ${uniqueId} deleted successfully`);
    } catch (err) {
      console.error("Error deleting event:", err);
      alert(`Error deleting event: ${err.message}`);
    }
  };

  // New function to handle explore button click
  const handleExplore = (event) => {
    setSelectedEvent(event);
    setShowExploreModal(true);
  };

  // Handle cancel delete
  const cancelDelete = () => {
    setShowConfirmDialog(false);
  };

  // Handle execute delete
  const executeDelete = (uniqueId) => {
    handleDelete(uniqueId);
    setShowConfirmDialog(false);
  };

  // Handle cancel edit
  const cancelEdit = () => {
    setShowEditDialog(false);
    setFormData({ event_name: "", description: "", event_date: "" }); // Clear form data
  };

  // Handle cancel create
  const cancelCreate = () => {
    setShowDialog(false);
    setFormData({ event_name: "", description: "", event_date: "" }); // Clear form data
  };

  // Handle loading and error states
  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: '#FFF2B2' }}>
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Events</h1>
          <p className="text-lg text-gray-600 mb-8">Manage your events here!</p>
        </header>

        {/* Button to open the modal */}
        <AddEventButton onClick={() => setShowDialog(true)} />

        {/* Use the new EventDialog component */}
        <EventDialog
          showDialog={showDialog}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setShowDialog={setShowDialog}
          isEditing={!!editingEvent}
          cancelCreate={cancelCreate} // Pass cancelCreate function
        />
        
        {/* Use the new ExploreModal component */}
        <ExploreModal
          showExploreModal={showExploreModal}
          selectedEvent={selectedEvent}         
          setShowExploreModal={setShowExploreModal}
        />

        <EditEventDialog
          showDialog={showEditDialog}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleEditSubmit}
          setShowDialog={setShowEditDialog}
          cancelEdit={cancelEdit} // Pass cancelEdit function
        />

        <div className="w-82 mx-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {data.length > 0 ? (
              data.map((item) => (
                <div key={item.unique_id} className="h-full">
                  <EventCard
                    item={item}
                    handleExplore={handleExplore}
                    handleDelete={handleDelete}
                    handleEdit={handleEdit}
                    cancelDelete={cancelDelete}
                    executeDelete={executeDelete}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">No events available</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Events;