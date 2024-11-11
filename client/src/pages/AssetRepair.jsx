import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddRepairButton from '../components/repair/AddRepairButton';
import RepairModal from '../components/repair/RepairModal';
import RepairTable from '../components/repair/RepairTable';

function AssetRepair() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [repairRecords, setRepairRecords] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    fetchRepairRecords();
    fetchAssets();
  }, []);

  const fetchRepairRecords = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/repair/read`);
      setRepairRecords(response.data);
    } catch (error) {
      console.error('Error fetching repair records:', error);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Assets/read`);
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setAssets([]);
    }
  };

  const handleAddRepair = async (formData) => {
    try {
      console.log('Sending repair data:', formData);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/repair/create`, formData);
      setRepairRecords(prevRecords => [...prevRecords, response.data]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding repair record:', error);
      throw error;
    }
  };

  const handleCompleteRecord = async (id) => {
    try {
      const repairRecord = repairRecords.find(record => record.id === id);
      
      await axios.put(`${process.env.REACT_APP_API_URL}/api/repair/complete/${id}`);
      
      if (repairRecord) {
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/asset-issues/resolve-by-asset/${repairRecord.asset_id}`,
            { status: 'Resolved' }
          );

          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/Assets/${repairRecord.asset_id}/status`,
            { 
              under_repair: false,
              has_issue: false
            }
          );

          setRepairRecords(prevRecords => 
            prevRecords.map(record => 
              record.id === id ? { ...record, status: 'Completed' } : record
            )
          );

        } catch (error) {
          console.error('Error updating related records:', error);
        }
      }
    } catch (error) {
      console.error('Error completing repair record:', error);
    }
  };

  const handleRemoveRecord = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/repair/delete/${id}`);
      setRepairRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    } catch (error) {
      console.error('Error removing repair record:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Asset Repair</h1>
      <AddRepairButton onClick={() => setIsModalOpen(true)} />
      <RepairModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddRepair={handleAddRepair}
        assets={assets}
      />
      <div className="mt-6">
        <RepairTable 
          repairRecords={repairRecords}
          assets={assets}
          onCompleteRecord={handleCompleteRecord}
          onRemoveRecord={handleRemoveRecord}
        />
      </div>
    </div>
  );
}

export default AssetRepair;
