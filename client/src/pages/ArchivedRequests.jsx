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
      <div id='recipients' className="space-y-6 ">
    {/* Header Section */}
    <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
      <h1 className="text-5xl font-extrabold text-black">Asset Repair</h1>
      <FontAwesomeIcon
        icon={faArchive}
        className="text-black text-5xl transform"
      />
    </div>

    <div className="px-4">
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
