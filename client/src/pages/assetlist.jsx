import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './assetlist.css';
import AssetSearchbar from "../components/assetlists/assetsearchbar";
import AssetTable from "../components/assetlists/assettable";
import InfoCards from "../components/assetlists/infocards";
import AddAsset from "../components/assetlists/addasset";
import AssetCategory from "../components/assetlists/addcategory";
import AssetLocation from "../components/assetlists/addlocation";
import SortDropdown from "../components/assetlists/sortdropdown";
import axios from 'axios';
import Modal from "../components/assetlists/modal";

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCriteria, setSortCriteria] = useState("");
  const [assetsForBorrowing, setAssetsForBorrowing] = useState(0);

  const checkServerConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5000/test');
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
          const response = await axios.get(`http://localhost:5000/api/assets/sorted?sortOrder=${sortCriteria}`);
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
      const response = await axios.get('http://localhost:5000/api/Assets/read');
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
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data.map(cat => cat.category_name));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/locations');
      setLocations(response.data.map(loc => loc.location_name));
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchTotalActiveAssets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/assets/active/count');
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
    } catch (error) {
      console.error("Error adding asset:", error);
    }
  }, []);

  const handleDeleteAsset = useCallback(async (assetId) => {
    try {
      console.log("Deleting asset with ID:", assetId);
      if (!assetId) {
        console.error("Asset ID is undefined or null");
        return;
      }
      const assetToDelete = assets.find(asset => asset.asset_id === assetId);
      await axios.delete(`http://localhost:5000/api/assets/delete/${assetId}`);
      console.log("Asset deleted from database");
      setAssets(prevAssets => prevAssets.filter(asset => asset.asset_id !== assetId));
      console.log("Asset removed from state");
      
      // Update assetsForBorrowing if the deleted asset was active
      if (assetToDelete && assetToDelete.is_active) {
        setAssetsForBorrowing(prevCount => prevCount - 1);
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  }, [assets]);

  const handleAddCategory = useCallback(async (newCategory) => {
    setCategories(prev => [...prev, newCategory]);
  }, []);

  const handleDeleteCategory = useCallback(async (categoryToDelete) => {
    setCategories(prevCategories => prevCategories.filter(category => category !== categoryToDelete));
    setAssets(prevAssets => prevAssets.map(asset => {
      if (asset.selectedCategory === categoryToDelete) {
        return { ...asset, selectedCategory: "" };
      }
      return asset;
    }));
  }, []);

  const handleAddLocation = useCallback(async (newLocation) => {
    setLocations(prev => [...prev, newLocation]);
  }, []);

  const handleDeleteLocation = useCallback(async (locationToDelete) => {
    setLocations(prevLocations => prevLocations.filter(location => location !== locationToDelete));
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

    // Update assetsForBorrowing if the active status has changed
    if (editedAsset.is_active !== previousAsset.is_active) {
      handleBorrowingChange(previousAsset, editedAsset.is_active);
    }
  }, [handleBorrowingChange]);

  const handleQuantityForBorrowingChange = useCallback((assetId, quantity) => {
    setAssets(prevAssets => prevAssets.map(asset => 
      asset.asset_id === assetId ? { ...asset, quantity_for_borrowing: quantity } : asset
    ));
  }, []);

  const updateAssetQuantity = useCallback(async (assetId, newQuantity) => {
    try {
      await axios.put(`http://localhost:5000/api/Assets/updateQuantity/${assetId}`, {
        quantity: newQuantity
      });

      setAssets(prevAssets => prevAssets.map(asset => 
        asset.asset_id === assetId ? { ...asset, quantity: newQuantity } : asset
      ));
    } catch (error) {
      console.error("Error updating asset quantity:", error);
    }
  }, []);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:5000/api/assets/sse');

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

  const totalAssets = filteredAndSortedAssets.length;
  const totalCost = filteredAndSortedAssets.reduce((acc, asset) => acc + parseFloat(asset.cost || 0), 0);

  return (
    <div className="asset-list-container">
      <InfoCards 
        totalAssets={totalAssets} 
        totalCost={`₱${totalCost.toFixed(2)}`}
        assetsForBorrowing={assetsForBorrowing}
      />
      
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
        onQuantityForBorrowingChange={handleQuantityForBorrowingChange}
      />
    </div>
  );
};

export default AssetList;