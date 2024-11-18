import React from 'react';
import Button from '../assetlists/Button';
import MaintenanceModal from './MaintenanceModal';

const AddMaintenance = ({ onAddMaintenance, assets, isModalOpen, onCloseModal, onOpenModal, user }) => {
  return (
    <>
      <Button 
        onClick={onOpenModal}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
      >
        Schedule Maintenance
      </Button>
      {isModalOpen && (
        <MaintenanceModal
          isOpen={isModalOpen}
          onClose={onCloseModal}
          onAddMaintenance={onAddMaintenance}
          assets={assets}
          user={user}
        />
      )}
    </>
  );
};

export default AddMaintenance; 