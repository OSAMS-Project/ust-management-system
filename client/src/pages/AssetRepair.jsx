import React, { useState, useEffect } from "react";
import axios from "axios";
import RepairModal from "../components/repair/RepairModal";
import RepairTable from "../components/repair/RepairTable";
import RepairLogs from "../components/repair/RepairLogs";
import PaginationControls from "../components/assetlists/PaginationControls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faToolbox } from "@fortawesome/free-solid-svg-icons";

function AssetRepair() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [repairRecords, setRepairRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchRepairRecords();
    fetchAssets();
  }, []);

  const fetchRepairRecords = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/repair/read`
      );
      setRepairRecords(response.data);
    } catch (error) {
      console.error("Error fetching repair records:", error);
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
      setAssets([]);
    }
  };

  const handleAddRepair = async (formData) => {
    try {
      console.log("Sending repair data:", formData);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/repair/create`,
        formData
      );
      setRepairRecords((prevRecords) => [...prevRecords, response.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding repair record:", error);
      throw error;
    }
  };

  const handleCompleteRecord = async (record) => {
    try {
      console.log("Completing repair record:", record);

      if (!record.id) {
        console.error("No repair ID found:", record);
        return;
      }

      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/repair/${record.id}/complete`
      );

      setRepairRecords((prevRecords) =>
        prevRecords.map((r) =>
          r.id === record.id ? { ...r, status: "Completed" } : r
        )
      );

      try {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/asset-issues/resolve-by-asset/${record.asset_id}`,
          { status: "Resolved" }
        );

        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/Assets/${record.asset_id}/status`,
          {
            under_repair: false,
            has_issue: false,
          }
        );
      } catch (error) {
        console.error("Error updating related records:", error);
      }
    } catch (error) {
      console.error("Error completing repair record:", error);
    }
  };

  const handleRemoveRecord = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/repair/delete/${id}`
      );
      setRepairRecords((prevRecords) =>
        prevRecords.filter((record) => record.id !== id)
      );
    } catch (error) {
      console.error("Error removing repair record:", error);
    }
  };

  const handleCancelRepair = async (record) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/repair/${record.id}/cancel`
      );
      
      // Remove the record from RepairTable
      setRepairRecords((prevRecords) =>
        prevRecords.filter((r) => r.id !== record.id)
      );
    } catch (error) {
      console.error("Error canceling repair:", error);
    }
  };

  const handleViewLogs = (assetId) => {
    setSelectedAssetId(assetId);
    setIsLogsModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const activeRepairs = repairRecords.filter(record => record.status !== 'Completed');

  const calculateStartIndex = () => (currentPage - 1) * itemsPerPage + 1;
  const calculateEndIndex = () =>
    Math.min(calculateStartIndex() + itemsPerPage - 1, activeRepairs.length);
  const totalPages = Math.ceil(activeRepairs.length / itemsPerPage);

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

  const paginatedRepairRecords = activeRepairs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 ">
    {/* Header Section */}
    <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
      <h1 className="text-5xl font-extrabold text-black">Asset Repair</h1>
      <FontAwesomeIcon
        icon={faToolbox}
        className="text-black text-5xl transform"
      />
    </div>

    <div className="px-4">
      <RepairModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddRepair={handleAddRepair}
        assets={assets}
      />
      <div className="mt-6">
        <RepairTable
          repairRecords={paginatedRepairRecords}
          assets={assets}
          onCompleteRecord={handleCompleteRecord}
          onRemoveRecord={handleRemoveRecord}
          onViewLogs={handleViewLogs}
          onCancelRepair={handleCancelRepair}
        />
        {activeRepairs.length > 0 && (
          <PaginationControls
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            calculateStartIndex={calculateStartIndex}
            calculateEndIndex={calculateEndIndex}
            totalItems={activeRepairs.length}
            itemName="repairs"
            renderPageNumbers={renderPageNumbers}
          />
        )}
      </div>
      {isLogsModalOpen && selectedAssetId && (
        <RepairLogs
          assetId={selectedAssetId}
          onClose={() => setIsLogsModalOpen(false)}
        />
      )}
    </div>
  </div>
  );
}

export default AssetRepair;
