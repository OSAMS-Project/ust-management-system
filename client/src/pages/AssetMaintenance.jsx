import React, { useState, useEffect } from "react";
import axios from "axios";
import AddMaintenance from "../components/maintenance/AddMaintenance";
import MaintenanceTable from "../components/maintenance/MaintenanceTable";
import NotificationPopup from "../components/utils/NotificationsPopup";
import PaginationControls from "../components/assetlists/PaginationControls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWrench } from "@fortawesome/free-solid-svg-icons";

function AssetMaintenance({ user }) {
  const [maintenances, setMaintenances] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchMaintenances();
    fetchAssets();
  }, []);

  const fetchMaintenances = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/maintenance`
      );
      setMaintenances(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching maintenances:", error);
      setLoading(false);
      setNotification({
        type: "error",
        message: "Failed to fetch maintenance records. Please try again.",
      });
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/Assets/read`
      );
      const nonConsumableAssets = response.data.filter(
        (asset) => asset.type === "Non-Consumable"
      );
      setAssets(nonConsumableAssets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setNotification({
        type: "error",
        message: "Failed to fetch assets. Please try again.",
      });
    }
  };

  const handleAddMaintenance = async (maintenanceData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/maintenance`,
        {
          ...maintenanceData,
          scheduled_by: user?.name || "Administrator",
          user_picture: user?.picture || "/osa-img.png",
        }
      );

      setMaintenances([response.data, ...maintenances]);
      setIsModalOpen(false);
      setNotification({
        type: "success",
        message: "Maintenance scheduled successfully!",
      });
    } catch (error) {
      console.error("Error adding maintenance:", error);
      setNotification({
        type: "error",
        message:
          error.response?.data?.error ||
          "Failed to schedule maintenance. Please try again.",
      });
    }
  };

  const handleRemoveMaintenance = async (maintenanceId) => {
    try {
      // First try to get the maintenance record to check if it exists
      const maintenanceRecord = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/maintenance/history/${maintenanceId}`
      );

      if (!maintenanceRecord.data || maintenanceRecord.data.length === 0) {
        // Record doesn't exist, might have been already deleted
        setMaintenances(
          maintenances.filter((maintenance) => maintenance.id !== maintenanceId)
        );
        setNotification({
          type: "success",
          message: "Maintenance record has been removed",
        });
        return;
      }

      // If record exists, proceed with deletion
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/maintenance/${maintenanceId}`
      );

      setMaintenances(
        maintenances.filter((maintenance) => maintenance.id !== maintenanceId)
      );
      setNotification({
        type: "success",
        message: "Maintenance record removed successfully",
      });
    } catch (error) {
      console.error("Error removing maintenance:", error);
      // Check if it's a 404 error, which means record doesn't exist
      if (error.response?.status === 404) {
        setMaintenances(
          maintenances.filter((maintenance) => maintenance.id !== maintenanceId)
        );
        setNotification({
          type: "info",
          message: "Maintenance record has already been removed",
        });
      } else {
        setNotification({
          type: "error",
          message:
            error.response?.data?.error ||
            "Failed to remove maintenance record",
        });
      }
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Update this to only count active maintenance tasks
  const activeMaintenances = maintenances.filter(
    (maintenance) => !maintenance.completion_date
  );

  const calculateStartIndex = () => (currentPage - 1) * itemsPerPage + 1;
  const calculateEndIndex = () =>
    Math.min(
      calculateStartIndex() + itemsPerPage - 1,
      activeMaintenances.length
    );
  const totalPages = Math.ceil(activeMaintenances.length / itemsPerPage);

  const paginatedMaintenances = activeMaintenances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    pageNumbers.push(
      ...Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index
      ).map((i) => (
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            i === currentPage
              ? "z-10 bg-[#FEC00F] text-black font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FEC00F]"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
          }`}
        >
          {i}
        </button>
      ))
    );

    return pageNumbers;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-6 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-black text-center sm:text-left mb-4 sm:mb-0">
          Asset Maintenance
        </h1>
        <FontAwesomeIcon
          icon={faWrench}
          className="text-black text-4xl sm:text-5xl transform"
        />
      </div>

      <div className="px-4 sm:px-6">
        <AddMaintenance
          onAddMaintenance={handleAddMaintenance}
          assets={assets}
          isModalOpen={isModalOpen}
          onCloseModal={() => setIsModalOpen(false)}
          onOpenModal={() => setIsModalOpen(true)}
          user={user}
          maintenances={maintenances}
        />

        <MaintenanceTable
          maintenances={maintenances}
          setMaintenances={setMaintenances}
          assets={assets}
          loading={loading}
          onRemoveMaintenance={handleRemoveMaintenance}
          setNotification={setNotification}
        />

        {activeMaintenances.length > 0 && (
          <PaginationControls
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            calculateStartIndex={calculateStartIndex}
            calculateEndIndex={calculateEndIndex}
            totalItems={activeMaintenances.length}
            itemName="maintenance"
            renderPageNumbers={renderPageNumbers}
          />
        )}

        <NotificationPopup
          notification={notification}
          onClose={() => setNotification(null)}
        />
      </div>
    </div>
  );
}

export default AssetMaintenance;
