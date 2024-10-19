import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './assetlist.css';
import AssetSearchbar from "../components/assetlists/assetsearchbar";
import AssetTable from "../components/assetlists/assettable";
import AddAsset from "../components/assetlists/addasset";
import AssetCategory from "../components/assetlists/addcategory";
import AssetLocation from "../components/assetlists/addlocation";
import SortDropdown from "../components/assetlists/sortdropdown";
import axios from 'axios';
import Modal from "../components/assetlists/modal";
import NotificationPopup from "../components/NotificationsPopup";

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCriteria, setSortCriteria] = useState("");
  const [assetsForBorrowing, setAssetsForBorrowing] = useState(0);
  const [notification, setNotification] = useState(null);

  const checkServerConnection = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/test`);
      console.log('Server connection test:', response.data);
    } catch (error) {
      console.error('Server connection test failed:', error.message);
    }
  };

  useEffect(() => {
    checkServerConnection();
    fetchAssets();
    fetchCategories();
    fetchLocations();
    fetchTotalActiveAssets();
  }, []);

  useEffect(() => {
    const fetchSortedAssets = async () => {
      if (sortCriteria === 'activeFirst' || sortCriteria === 'inactiveFirst') {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/assets/sorted?sortOrder=${sortCriteria}`);
          setAssets(response.data);
        } catch (error) {
          console.error("Error fetching sorted assets:", error);
        }
      }
    };

    fetchSortedAssets();
  }, [sortCriteria]);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Assets/read`);
      setAssets(response.data);
    } catch (error) {
      console.error("Error fetching assets:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`);
      setCategories(response.data.map(cat => cat.category_name));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/locations`);
      setLocations(response.data.map(loc => loc.location_name));
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchTotalActiveAssets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/assets/active/count`);
      setAssetsForBorrowing(response.data.count);
    } catch (error) {
      console.error("Error fetching total active assets:", error);
      setAssetsForBorrowing(0);
    }
  };

  const handleAddAsset = useCallback(async (newAsset) => {
    try {
      setAssets(prevAssets => [...prevAssets, newAsset]);
      setIsModalOpen(false);
      showNotification('Asset added successfully');
    } catch (error) {
      console.error("Error adding asset:", error);
      showNotification('Error adding asset', 'error');
    }
  }, []);

  const handleDeleteAsset = useCallback(async (assetId) => {
    try {
      if (!assetId) {
        return;
      }
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/Assets/delete/${assetId}`);
      if (response.status === 200) {
        setAssets(prevAssets => prevAssets.filter(asset => asset.asset_id !== assetId));
        showNotification('Asset deleted successfully');
      } else {
        throw new Error('Failed to delete asset');
      }
    } catch (error) {
      showNotification('Error deleting asset', 'error');
    }
  }, []);

  const handleAddCategory = useCallback(async (newCategory) => {
    setCategories(prev => [...prev, newCategory]);
    showNotification('Category added successfully');
  }, []);

  const handleDeleteCategory = useCallback(async (categoryToDelete) => {
    setCategories(prevCategories => prevCategories.filter(category => category !== categoryToDelete));
    showNotification('Category deleted successfully');
    setAssets(prevAssets => prevAssets.map(asset => {
      if (asset.selectedCategory === categoryToDelete) {
        return { ...asset, selectedCategory: "" };
      }
      return asset;
    }));
  }, []);

  const handleAddLocation = useCallback(async (newLocation) => {
    setLocations(prev => [...prev, newLocation]);
    showNotification('Location added successfully');
  }, []);

  const handleDeleteLocation = useCallback(async (locationToDelete) => {
    setLocations(prevLocations => prevLocations.filter(location => location !== locationToDelete));
    showNotification('Location deleted successfully');
    setAssets(prevAssets => prevAssets.map(asset => {
    
      if (asset.selectedLocation === locationToDelete) {
        return { ...asset, selectedLocation: "" };
      }
      return asset;
    }));
  }, []);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleSearch = useCallback((query) => setSearchQuery(query), []);
  const handleSort = useCallback((criteria) => setSortCriteria(criteria), []);

  const handleBorrowingChange = useCallback((newCount) => {
    setAssetsForBorrowing(newCount);
  }, []);

  const handleEditAsset = useCallback((editedAsset, previousAsset) => {
    setAssets(prevAssets => prevAssets.map(asset => 
      asset.asset_id === editedAsset.asset_id ? editedAsset : asset
    ));
    showNotification('Asset edited successfully');

    // Update assetsForBorrowing if the active status has changed
    if (editedAsset.is_active !== previousAsset.is_active) {
      handleBorrowingChange(previousAsset, editedAsset.is_active);
    }
  }, [handleBorrowingChange]);

  const updateAssetQuantity = useCallback(async (assetId, newQuantity) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/Assets/updateQuantity/${assetId}`, {
        quantity: newQuantity
      });
      if (response.data.success) {
        setAssets(prevAssets => prevAssets.map(asset => 
          asset.asset_id === assetId ? { ...asset, quantity: newQuantity } : asset
        ));
      } else {
        throw new Error(response.data.message || 'Failed to update asset quantity');
      }
    } catch (error) {
      console.error("Error updating asset quantity:", error);
      alert(`Error updating asset quantity: ${error.response?.data?.message || error.message}`);
    }
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(`${process.env.REACT_APP_API_URL}/api/assets/sse`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'assetQuantityUpdate') {
        setAssets(prevAssets => prevAssets.map(asset => 
          asset.asset_id === data.assetId ? { ...asset, quantity: data.newQuantity } : asset
        ));
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const filteredAndSortedAssets = useMemo(() => {
    return assets
      .filter(asset => asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        switch (sortCriteria) {
          case "dateAsc":
            return new Date(a.createdDate) - new Date(b.createdDate);
          case "dateDesc":
            return new Date(b.createdDate) - new Date(a.createdDate);
          case "quantityAsc":
            return a.quantity - b.quantity;
          case "quantityDesc":
            return b.quantity - a.quantity;
          case "nameAsc":
            return a.assetName.localeCompare(b.assetName);
          case "nameDesc":
            return b.assetName.localeCompare(a.assetName);
          case "activeFirst":
            return (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0);
          case "inactiveFirst":
            return (a.is_active ? 1 : 0) - (b.is_active ? 1 : 0);
          default:
            return 0;
        }
      });
  }, [assets, searchQuery, sortCriteria]);



  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Hide after 3 seconds
  };

  return (
    <div className="asset-list-container">     
      {/* Add this new div to contain the search bar and sort dropdown */}
      <div className="flex justify-between items-center mb-4">
        <AssetSearchbar handleSearch={handleSearch} />
        <SortDropdown onSort={handleSort} />
      </div>

      <div className="flex space-x-4 mb-4">
        <AssetCategory 
          onSaveCategory={handleAddCategory} 
          onDeleteCategory={handleDeleteCategory}
          categories={categories}
        />
        <AssetLocation 
          onSaveLocation={handleAddLocation} 
          onDeleteLocation={handleDeleteLocation}
          locations={locations}
        />
        <AddAsset
          onAddAsset={handleAddAsset}
          categories={categories}
          locations={locations}
          isModalOpen={isModalOpen}
          onCloseModal={handleCloseModal}
          onOpenModal={handleOpenModal}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        categories={categories}
        locations={locations}
        onAddAsset={handleAddAsset}
      />

      <AssetTable
        assets={filteredAndSortedAssets}
        setAssets={setAssets}
        categories={categories}
        locations={locations}
        onDeleteAsset={handleDeleteAsset}
        onEditAsset={handleEditAsset}
        onBorrowingChange={handleBorrowingChange}
        updateAssetQuantity={updateAssetQuantity}
      />
      
      <NotificationPopup 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />
    </div>
  );
};

export default AssetList;