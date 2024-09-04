import React, { useState, useCallback, useMemo, useEffect } from 'react';
import './assetlist.css';
import AssetSearchbar from "./components/assetlists/assetsearchbar";
import AssetTable from "./components/assetlists/assettable";
import InfoCards from "./components/assetlists/infocards";
import AddAsset from "./components/assetlists/addasset";
import AssetCategory from "./components/assetlists/addcategory";
import AssetLocation from "./components/assetlists/addlocation";
import SortDropdown from "./components/assetlists/sortdropdown";
import axios from 'axios';

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAssetIDs, setActiveAssetIDs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCriteria, setSortCriteria] = useState("");

  useEffect(() => {
    fetchAssets();
    fetchCategories();
    fetchLocations();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/Assets/read');
      setAssets(response.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
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

  const handleAddAsset = useCallback((newAsset) => {
    setAssets(prevAssets => [...prevAssets, newAsset]);
    setIsModalOpen(false);
  }, []);

  const handleDeleteAsset = useCallback((id) => {
    setAssets(prevAssets => prevAssets.filter(asset => asset.assetID !== id));
    setActiveAssetIDs(prevActiveIDs => prevActiveIDs.filter(assetID => assetID !== id));
  }, []);

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
  const handleAllocate = useCallback((id, allocation) => {
    setAssets(prevAssets => prevAssets.map(asset =>
      asset.assetID === id
        ? { ...asset, quantity: Math.max(asset.quantity - allocation, 0) }
        : asset
    ));
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
          case "borrowActive":
            return activeAssetIDs.includes(a.assetID) ? -1 : 1;
          case "borrowInactive":
            return activeAssetIDs.includes(a.assetID) ? 1 : -1;
          case "nameAsc":
            return a.assetName.localeCompare(b.assetName);
          case "nameDesc":
            return b.assetName.localeCompare(a.assetName);
          default:
            return 0;
        }
      });
  }, [assets, searchQuery, sortCriteria, activeAssetIDs]);

  const totalAssets = filteredAndSortedAssets.length;
  const totalCost = filteredAndSortedAssets.reduce((acc, asset) => acc + parseFloat(asset.cost || 0), 0);
  const assetsForBorrowing = activeAssetIDs.length;

  const handleEditAsset = (editedAsset) => {
    setAssets(prevAssets => prevAssets.map(asset => 
      asset.assetID === editedAsset.assetID ? editedAsset : asset
    ));
  };

  return (
    <div className="asset-list-container">
      <InfoCards 
        totalAssets={totalAssets} 
        totalCost={`₱${totalCost.toFixed(2)}`} 
        assetsForBorrowing={assetsForBorrowing} 
      />
      <AssetSearchbar handleSearch={handleSearch} />
      <SortDropdown onSort={handleSort} />

      {/* Wrap the buttons in a flex container */}
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

      <AssetTable
        assets={filteredAndSortedAssets}
        onDeleteAsset={handleDeleteAsset}
        activeAssetIDs={activeAssetIDs}
        setActiveAssetIDs={setActiveAssetIDs}
        onAllocateAsset={handleAllocate}
        onEditAsset={handleEditAsset}
        categories={categories}
        locations={locations}
      />
    </div>
  );
};

export default AssetList;
