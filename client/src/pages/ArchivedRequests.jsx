import React, { useState, useEffect } from "react";
import axios from "axios";
import ArchivedRequestTable from "../components/assetrequest/ArchivedRequestTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArchive } from "@fortawesome/free-solid-svg-icons";

const ArchivedRequests = ({ user }) => {
  const [archivedRequests, setArchivedRequests] = useState([]);

  const fetchArchivedRequests = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/asset-request/archived`
      );
      setArchivedRequests(response.data);
    } catch (error) {
      console.error("Error fetching archived requests:", error);
    }
  };

  useEffect(() => {
    fetchArchivedRequests();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/asset-request/${id}`
      );
      fetchArchivedRequests();
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  return (
    <div id="recipients" className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-6 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-black text-center sm:text-left">
          Archived Request
        </h1>
        <FontAwesomeIcon
          icon={faArchive}
          className="text-4xl sm:text-5xl text-black mt-2 sm:mt-0"
        />
      </div>

      {/* Table Section */}
      <div className="px-4">
        <ArchivedRequestTable
          archivedRequests={archivedRequests}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default ArchivedRequests;
