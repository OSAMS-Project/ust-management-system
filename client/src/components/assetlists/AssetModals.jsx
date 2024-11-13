import React from 'react';
import AssetDetailsModal from './AssetDetailsModal';
import EditAssetModal from './EditAssetModal';
import ConfirmationModal from '../utils/DeleteConfirmationModal';
import QuantityForBorrowingModal from './QuantityForBorrowing';
import NotificationPopup from '../utils/NotificationsPopup';

const AssetModals = ({
  selectedImage,
  selectedAsset,
  editingAsset,
  isDeleteModalOpen,
  assetToDelete,
  isQuantityModalOpen,
  selectedAssetForBorrowing,
  notification,
  handleCloseImageModal,
  setSelectedAsset,
  handleEditAsset,
  setEditingAsset,
  handleDeleteConfirm,
  setIsDeleteModalOpen,
  handleQuantityConfirm,
  setIsQuantityModalOpen,
  setNotification,
  categories,
  locations
}) => {
  return (
    <>
      {/* Modal for enlarged image */}
      {selectedImage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <img
              src={selectedImage}
              alt="Enlarged Asset"
              className="h-96 w-96 object-cover"
            />
            <button className="modal-close-btn" onClick={handleCloseImageModal}>
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {selectedAsset && (
        <AssetDetailsModal
          selectedAsset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}

      {/* Edit Asset Modal */}
      <EditAssetModal
        isOpen={editingAsset !== null}
        onClose={() => setEditingAsset(null)}
        asset={editingAsset}
        categories={categories}
        locations={locations}
        onEditAsset={handleEditAsset}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        message={
          assetToDelete?.is_active 
            ? `Warning: "${assetToDelete?.assetName}" has active borrowing requests. Deleting this asset will also remove all associated borrowing requests. Are you sure you want to proceed?`
            : `Are you sure you want to delete the asset "${assetToDelete?.assetName}"? This action cannot be undone.`
        }
      />

      <QuantityForBorrowingModal
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        onConfirm={handleQuantityConfirm}
        maxQuantity={
          selectedAssetForBorrowing ? selectedAssetForBorrowing.quantity : 1
        }
      />

      <NotificationPopup
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </>
  );
};

export default AssetModals; 