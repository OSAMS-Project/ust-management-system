import React from 'react';
import Button from '../assetlists/Button';
import IssueModal from './IssueModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const AddAssetIssue = ({ onAddIssue, assets, isModalOpen, onCloseModal, onOpenModal, user, issues }) => {
  return (
    <>
      <Button 
        onClick={onOpenModal}
        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors mb-6"
      >
        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
        Report Issue
      </Button>
      {isModalOpen && (
        <IssueModal
          isOpen={isModalOpen}
          onClose={onCloseModal}
          onAddIssue={onAddIssue}
          assets={assets}
          user={user}
          issues={issues}
        />
      )}
    </>
  );
};

export default AddAssetIssue;

