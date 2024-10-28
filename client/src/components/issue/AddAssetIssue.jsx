import React from 'react';
import Button from '../assetlists/button';
import IssueModal from './IssueModal';

const AddAssetIssue = ({ onAddIssue, assets, isModalOpen, onCloseModal, onOpenModal, user }) => {
  return (
    <>
      <Button 
        onClick={onOpenModal}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md"
      >
        Report Issue
      </Button>
      {isModalOpen && (
        <IssueModal
          isOpen={isModalOpen}
          onClose={onCloseModal}
          onAddIssue={onAddIssue}
          assets={assets}
          user={user}
        />
      )}
    </>
  );
};

export default AddAssetIssue;

