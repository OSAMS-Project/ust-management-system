import React, { useState, useCallback } from "react";
import Button from "./Button";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import DeleteConfirmationModal from '../utils/DeleteConfirmationModal';

const Modal = ({
  isOpen,
  onClose,
  onSaveCategory,
  categories,
  onDeleteCategory,
}) => {
  const [category, setCategory] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleSaveCategory = async () => {
    if (!category.trim()) return;
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/categories`,
        { categoryName: category }
      );
      onSaveCategory(response.data.category_name);
      setCategory("");
      onClose();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (cat) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/categories/${encodeURIComponent(cat)}`
      );
      onDeleteCategory(cat);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative">
      <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 1000 }}>
        <div className="fixed inset-0 bg-black bg-opacity-50"></div>
        <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-xl relative">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Add Category</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Existing Categories</h3>
              <div className="space-y-2">
                {categories.map((cat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card text-card-foreground transition-colors hover:bg-muted/50"
                  >
                    <span className="text-sm">{cat}</span>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        className="h-8 w-8 text-gray-500 hover:text-red-500 flex items-center justify-center"
                        onClick={() => {
                          setCategoryToDelete(cat);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="h-4 w-4" />
                        <span className="sr-only">Delete category</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveCategory}
              className="px-4 py-2"
            >
              Save Category
            </Button>
          </div>
        </div>
      </div>
      <div style={{ zIndex: 1100 }}>
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
          message={`Are you sure you want to delete "${categoryToDelete}"?`}
        />
      </div>
    </div>
  );
};

const AssetCategory = ({ onSaveCategory, onDeleteCategory, categories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <div className="group-button">
      <Button
        onClick={handleOpenModal}
        className="px-3 py-2 border-2 border-black text-black bg-green-400 rounded-md hover:bg-green-300 duration-300"
      >
        Add Category
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSaveCategory={onSaveCategory}
        categories={categories}
        onDeleteCategory={onDeleteCategory}
      />
    </div>
  );
};

export default AssetCategory;
