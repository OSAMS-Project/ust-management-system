import React, { useState, useCallback } from "react";
import Button from "./Button";
import axios from "axios";

const Modal = ({
  isOpen,
  onClose,
  onSaveCategory,
  categories,
  onDeleteCategory,
}) => {
  const [category, setCategory] = useState("");

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
        `${process.env.REACT_APP_API_URL}/api/categories/${encodeURIComponent(
          cat
        )}`
      );
      onDeleteCategory(cat);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add Category</h2>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
            />
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">
              Existing Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((cat, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded"
                >
                  <span className="text-gray-800">{cat}</span>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition-colors duration-300"
                    onClick={() => handleDeleteCategory(cat)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-300"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
            onClick={handleSaveCategory}
          >
            Save Category
          </Button>
        </div>
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
        className="bg-green-400 border border-black text-black px-4 py-2 rounded hover:bg-green-300 transition-colors duration-300"
      >
        <span className="text-black">Add Category </span>
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
