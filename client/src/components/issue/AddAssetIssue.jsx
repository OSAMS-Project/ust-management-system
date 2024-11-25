import React from 'react';
import Button from '../assetlists/Button';
import IssueModal from './IssueModal';

const AddAssetIssue = ({ onAddIssue, assets, isModalOpen, onCloseModal, onOpenModal, user, issues }) => {
  return (
    <>
      <Button 
        onClick={onOpenModal}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors mb-6"
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
          issues={issues}
        />
      )}
    </>
  );
};

export default AddAssetIssue;

