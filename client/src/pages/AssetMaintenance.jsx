import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddMaintenanceButton from '../components/maintenance/AddMaintenanceButton';
import MaintenanceModal from '../components/maintenance/MaintenanceModal';
import MaintenanceTable from '../components/maintenance/MaintenanceTable';

function AssetMaintenance() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);

  useEffect(() => {
    fetchMaintenanceRecords();
  }, []);

  const fetchMaintenanceRecords = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Maintenance/read`);
      setMaintenanceRecords(response.data);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddMaintenance = async (newMaintenanceData) => {
    try {
      console.log('Sending maintenance data:', newMaintenanceData);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/Maintenance/create`, newMaintenanceData);
      setMaintenanceRecords([...maintenanceRecords, response.data]);
      handleCloseModal();
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
    }
  };

  const handleCompleteRecord = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/Maintenance/complete/${id}`);
      setMaintenanceRecords(prevRecords => 
        prevRecords.map(record => 
          record.id === id ? { ...record, status: 'Completed' } : record
        )
      );
    } catch (error) {
      console.error('Error completing maintenance record:', error);
    }
  };

  const handleRemoveRecord = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/Maintenance/delete/${id}`);
      setMaintenanceRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    } catch (error) {
      console.error('Error removing maintenance record:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Asset Maintenance</h1>
      <AddMaintenanceButton onClick={handleOpenModal} />
      <MaintenanceModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onAddMaintenance={handleAddMaintenance}
      />
      <div className="mt-6">
        <MaintenanceTable 
          maintenanceRecords={maintenanceRecords}
          onCompleteRecord={handleCompleteRecord}
          onRemoveRecord={handleRemoveRecord}
        />
      </div>
    </div>
  );
}

export default AssetMaintenance;
