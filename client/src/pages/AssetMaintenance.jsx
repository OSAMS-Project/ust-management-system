import React, { useState, useEffect } from "react";
import axios from "axios";
import AddMaintenance from "../components/maintenance/AddMaintenance";
import MaintenanceTable from "../components/maintenance/MaintenanceTable";
import EditMaintenanceModal from "../components/maintenance/EditMaintenanceModal";
import NotificationPopup from "../components/utils/NotificationsPopup";
import PaginationControls from "../components/assetlists/PaginationControls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools } from "@fortawesome/free-solid-svg-icons";

function AssetMaintenance({ user }) {
  const [maintenances, setMaintenances] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
          scheduled_by: user?.name,
          user_picture: user?.picture,
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

  const handleEditMaintenance = async (maintenanceId, editData) => {
    try {
      if (editData.completion_date) {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/maintenance/${maintenanceId}`,
          { completion_date: editData.completion_date }
        );

        setMaintenances(maintenances.filter((m) => m.id !== maintenanceId));
        setNotification({
          type: "success",
          message: "Maintenance marked as completed",
        });
      } else {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/maintenance/${maintenanceId}`,
          editData
        );

        setMaintenances(
          maintenances.map((maintenance) =>
            maintenance.id === maintenanceId
              ? { ...maintenance, ...editData }
              : maintenance
          )
        );
        setIsEditModalOpen(false);
        setSelectedMaintenance(null);
        setNotification({
          type: "success",
          message: "Maintenance record updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating maintenance:", error);
      setNotification({
        type: "error",
        message: "Failed to update maintenance record",
      });
    }
  };

  const handleRemoveMaintenance = async (maintenanceId) => {
    try {
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
      setNotification({
        type: "error",
        message: "Failed to remove maintenance record",
      });
    }
  };

  const handleOpenEditModal = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsEditModalOpen(true);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const calculateStartIndex = () => (currentPage - 1) * itemsPerPage + 1;
  const calculateEndIndex = () =>
    Math.min(calculateStartIndex() + itemsPerPage - 1, maintenances.length);
  const totalPages = Math.ceil(maintenances.length / itemsPerPage);

  const paginatedMaintenances = maintenances.slice(
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
    <div className="space-y-6 ">
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">Asset Repair</h1>
        <FontAwesomeIcon
          icon={faTools}
          className="text-black text-5xl transform"
        />
      </div>

      <div className="px-4">
        <AddMaintenance
          onAddMaintenance={handleAddMaintenance}
          assets={assets}
          isModalOpen={isModalOpen}
          onCloseModal={() => setIsModalOpen(false)}
          onOpenModal={() => setIsModalOpen(true)}
          user={user}
        />

        <MaintenanceTable
          maintenances={paginatedMaintenances}
          assets={assets}
          loading={loading}
          onEditMaintenance={handleEditMaintenance}
          onRemoveMaintenance={handleRemoveMaintenance}
        />

        {maintenances.length > 0 && (
          <PaginationControls
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            calculateStartIndex={calculateStartIndex}
            calculateEndIndex={calculateEndIndex}
            totalItems={maintenances.length}
            renderPageNumbers={renderPageNumbers}
          />
        )}

        {isEditModalOpen && selectedMaintenance && (
          <EditMaintenanceModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedMaintenance(null);
            }}
            onEditMaintenance={handleEditMaintenance}
            maintenance={selectedMaintenance}
            assets={assets}
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
