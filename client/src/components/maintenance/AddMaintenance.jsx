import React from 'react';
import ReactDOM from 'react-dom';
import MaintenanceModal from './MaintenanceModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench } from '@fortawesome/free-solid-svg-icons';

const AddMaintenance = ({ onAddMaintenance, assets, isModalOpen, onCloseModal, onOpenModal, user, maintenances }) => {
  return (
    <div>
      <button 
        onClick={onOpenModal}
        className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-black font-medium transition-colors mb-4"
      >
        <FontAwesomeIcon icon={faWrench} className="mr-2" />
        Schedule Maintenance
      </button>

      {isModalOpen && ReactDOM.createPortal(
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all animate-fadeIn">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-black">Schedule Maintenance</h3>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <MaintenanceModal
                  isOpen={isModalOpen}
                  onClose={onCloseModal}
                  onAddMaintenance={onAddMaintenance}
                  assets={assets}
                  user={user}
                  maintenances={maintenances}
                />
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default AddMaintenance; 