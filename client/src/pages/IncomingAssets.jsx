import React, { useState, useEffect } from "react";
import axios from "axios";
import NotificationPopup from "../components/utils/NotificationsPopup";
import AddIncomingAssetForm from "../components/incomingassets/AddIncomingAssetForm";
import LocationDialog from "../components/incomingassets/LocationDialog";
import IncomingAssetsTable from "../components/incomingassets/IncomingAssetsTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTruckFast } from "@fortawesome/free-solid-svg-icons";

const IncomingAssets = () => {
  const [assets, setAssets] = useState([]);
  const [receivedAssets, setReceivedAssets] = useState([]);
  const [currentReceivedAssets, setCurrentReceivedAssets] = useState([]);
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [receivedCurrentPage, setReceivedCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [formData, setFormData] = useState({
    assetName: "",
    description: "",
    type: "Consumable",
    category: "",
    cost: "",
    quantity: "",
    total_cost: "",
    expected_date: "",
    notes: "",
  });
  const [categories, setCategories] = useState([]);
  const [notification, setNotification] = useState(null);
  const [currentPendingAssets, setCurrentPendingAssets] = useState([]);

  useEffect(() => {
    fetchAssets();
    fetchCategories();
    fetchLocations();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/incoming-assets`
      );
      const allAssets = response.data;

      const pending = allAssets.filter((asset) => asset.status !== "received");
      const received = allAssets.filter((asset) => asset.status === "received");

      setAssets(allAssets);
      setCurrentPendingAssets(pending.slice(0, itemsPerPage));
      setReceivedAssets(received);
      setCurrentReceivedAssets(received.slice(0, itemsPerPage));
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/categories`
      );
      setCategories(response.data.map((cat) => cat.category_name));
    } catch (error) {
      console.error("Error fetching categories:", error);
      setNotification({ type: "error", message: "Failed to fetch categories" });
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/locations`
      );
      setLocations(response.data.map((loc) => loc.location_name));
    } catch (error) {
      console.error("Error fetching locations:", error);
      setNotification({ type: "error", message: "Failed to fetch locations" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Automatically calculate total cost when cost or quantity changes
      if (name === "cost" || name === "quantity") {
        const cost = parseFloat(newData.cost) || 0;
        const quantity = parseInt(newData.quantity) || 0;
        newData.total_cost = (cost * quantity).toFixed(2);
      }

      return newData;
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/assets/incoming`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
  
      const result = await response.json();
  
      if (response.ok) {
        setNotification({ type: "success", message: result.message });
        const newAsset = result.asset; // Assuming the response includes the new asset
  
        // Dynamically update assets and pending assets
        setAssets((prevAssets) => {
          const updatedAssets = [...prevAssets, newAsset];
          const pending = updatedAssets.filter(
            (asset) => asset.status !== "received"
          );
          setCurrentPendingAssets(
            pending.slice(0, itemsPerPage) // Adjust to current page view
          );
          return updatedAssets;
        });
  
        resetFormData();
        setShowForm(false);
      } else {
        console.error("Error response from server:", result);
        setNotification({ type: "error", message: result.error });
      }
    } catch (error) {
      console.error("Error handling asset submission:", error);
      setNotification({
        type: "error",
        message: "Failed to process the asset.",
      });
    }
  };
  

  const handleStatusUpdate = async (asset) => {
    setSelectedAsset(asset);
    setShowLocationDialog(true);
  };
  const handleLocationSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Step 1: Mark the incoming asset as "received"
      await axios.put(`${process.env.REACT_APP_API_URL}/api/incoming-assets/${selectedAsset.id}/status`, {
        status: "received",
        location: selectedLocation,
      });
  
      // Step 2: Check if the asset already exists in the main assets table
      const existingAssetResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/assets/check-name`,
        { assetName: selectedAsset.assetName }
      );
  
      const existingAsset = existingAssetResponse.data;
  
      if (existingAsset) {
        // Step 3: Update the existing asset's quantity
        const updatedQuantity =
          parseInt(existingAsset.quantity || 0, 10) +
          parseInt(selectedAsset.quantity || 0, 10); // Ensure both are integers
  
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/assets/update/${existingAsset.asset_id}`,
          { quantity: updatedQuantity }
        );
  
        setNotification({
          type: "success",
          message: `Quantity updated for asset: ${existingAsset.assetName}.`,
        });
      } else {
        // Step 4: Create a new asset if it doesn't exist
        const newAssetData = {
          assetName: selectedAsset.assetName,
          quantity: parseInt(selectedAsset.quantity || 0, 10), // Ensure integer
          category: selectedAsset.category,
          location: selectedLocation,
          cost: parseFloat(selectedAsset.cost || 0), // Ensure float
          type: selectedAsset.type,
        };
  
        await axios.post(`${process.env.REACT_APP_API_URL}/api/assets/create`, newAssetData);
  
        setNotification({
          type: "success",
          message: `New asset created: ${selectedAsset.assetName}.`,
        });
      }
  
      // Step 5: Refresh the data and reset dialog
      setShowLocationDialog(false);
      setSelectedLocation("");
      fetchAssets();
    } catch (error) {
      console.error("Error processing asset:", error);
      if (error.response) {
        setNotification({
          type: "error",
          message: `Failed to process asset: ${error.response.data.message || error.message}`,
        });
      } else {
        setNotification({
          type: "error",
          message: `Failed to process asset: ${error.message}`,
        });
      }
    }
  };
  
  

  const today = new Date().toISOString().split("T")[0];

  const resetFormData = () => {
    setFormData({
      assetName: "",
      description: "",
      type: "Consumable",
      category: "",
      cost: "",
      quantity: "",
      total_cost: "",
      expected_date: "",
      notes: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-4">
        <h1 className="text-5xl font-extrabold text-black">Incoming Assets</h1>
        <FontAwesomeIcon
          icon={faTruckFast}
          className="text-black text-5xl transform"
        />
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors m-3"
      >
        Add Incoming Asset
      </button>

      <div id="recipients" className="mt-2 lg:mt-0 rounded bg-white">
        <IncomingAssetsTable
          assets={assets}
          handleStatusUpdate={handleStatusUpdate}
          pendingCurrentPage={pendingCurrentPage}
          setPendingCurrentPage={setPendingCurrentPage}
          receivedCurrentPage={receivedCurrentPage}
          setReceivedCurrentPage={setReceivedCurrentPage}
          itemsPerPage={itemsPerPage}
          receivedAssets={receivedAssets}
          currentReceivedAssets={currentReceivedAssets}
          currentPendingAssets={currentPendingAssets}
        />
      </div>

      {showForm && (
        <AddIncomingAssetForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          setShowForm={setShowForm}
          categories={categories}
          today={today}
          setNotification={setNotification}
          resetFormData={resetFormData}
        />
      )}

      {showLocationDialog && (
        <LocationDialog
          showLocationDialog={showLocationDialog}
          setShowLocationDialog={setShowLocationDialog}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          locations={locations}
          handleLocationSubmit={handleLocationSubmit}
        />
      )}

      <NotificationPopup
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default IncomingAssets;
