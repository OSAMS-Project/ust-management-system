import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ArchivedRequestTable from '../components/assetrequest/ArchivedRequestTable';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArchive } from "@fortawesome/free-solid-svg-icons";

const ArchivedRequests = ({ user }) => {
  const [archivedRequests, setArchivedRequests] = useState([]);

  const fetchArchivedRequests = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/asset-request/archived`);
      setArchivedRequests(response.data);
    } catch (error) {
      console.error('Error fetching archived requests:', error);
    }
  };

  useEffect(() => {
    fetchArchivedRequests();
  }, []);

  const handleRestore = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/asset-request/${id}/restore`);
      fetchArchivedRequests();
    } catch (error) {
      console.error('Error restoring request:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/asset-request/${id}`);
      fetchArchivedRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">
          Archived Requests
        </h1>
        <FontAwesomeIcon
          icon={faArchive}
          className="text-black text-5xl transform"
        />
      </div>

      <div className="flex items-center mb-4 px-2">
        <img src={user?.picture || "https://via.placeholder.com/40"} alt="Profile" className="w-10 h-10 rounded-full object-cover mr-2" />
        <p className="text-lg">Logged in as: {user?.name || "User"}</p>
      </div>

      <div id='recipients' className="p-4 mt-4 lg:mt-0 rounded shadow bg-white">
        <ArchivedRequestTable 
          archivedRequests={archivedRequests}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default ArchivedRequests;
