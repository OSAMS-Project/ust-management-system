import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./AssetList.css";
import AssetSearchbar from "../components/assetlists/AssetSearchBar";
import AssetTable from "../components/assetlists/AssetTable";
import AddAsset from "../components/assetlists/AddAsset";
import AssetCategory from "../components/assetlists/AddCategory";
import AssetLocation from "../components/assetlists/AddLocation";
import axios from "axios";
import NotificationPopup from "../components/utils/NotificationsPopup";
import moment from "moment";
import AssetTypeFilter from "../components/assetlists/AssetTypeFilter";

const AssetList = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCriteria,] = useState("");
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalAssetsChange, setTotalAssetsChange] = useState(0);
  const [stockPrice, setStockPrice] = useState(0);
  const [stockPriceChange, setStockPriceChange] = useState({
    absolute: 0,
    percent: 0,
  });
  const [assetsForBorrowing, setAssetsForBorrowing] = useState(0);
  const [assetsForBorrowingChange, setAssetsForBorrowingChange] = useState({
    absolute: 0,
    percent: 0,
  });
  const [notification, setNotification] = useState(null);
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');

  const checkServerConnection = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/test`);
      console.log("Server connection test:", response.data);
    } catch (error) {
      console.error("Server connection test failed:", error.message);
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
      if (sortCriteria === "activeFirst" || sortCriteria === "inactiveFirst") {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/assets/sorted?sortOrder=${sortCriteria}`
          );
          setAssets(response.data);
        } catch (error) {
          console.error("Error fetching sorted assets:", error);
        }
      }
    };

    fetchSortedAssets();
  }, [sortCriteria]);
  const calculateTotals = (assetData) => {
    const total = assetData.length;
    const stock = assetData.reduce(
      (acc, asset) => acc + asset.cost * asset.quantity,
      0
    );
    const borrowing = assetData.reduce(
      (acc, asset) =>
        asset.is_active ? acc + (asset.quantity_for_borrowing || 0) : acc,
      0
    );

    setTotalAssets(total);
    setStockPrice(stock.toFixed(2));
    setAssetsForBorrowing(borrowing);
  };

  const calculateWeeklyChanges = (assetData) => {
    const oneWeekAgo = moment().subtract(7, "days");

    // Filter assets that were created in the last 7 days
    const recentAssets = assetData.filter((asset) =>
      moment(asset.createdDate).isAfter(oneWeekAgo)
    );

    // Total Assets Change (number of assets added in the last 7 days)
    const newAssetsCount = recentAssets.length;
    setTotalAssetsChange(newAssetsCount);

    // Stock Price Change
    const stockPriceLastWeek = assetData
      .filter((asset) => moment(asset.createdDate).isBefore(oneWeekAgo))
      .reduce((acc, asset) => acc + asset.cost * asset.quantity, 0);
    const stockPriceCurrent = assetData.reduce(
      (acc, asset) => acc + asset.cost * asset.quantity,
      0
    );
    const stockPriceAbsoluteChange = stockPriceCurrent - stockPriceLastWeek;
    const stockPricePercentChange = (
      (stockPriceAbsoluteChange / (stockPriceLastWeek || 1)) *
      100
    ).toFixed(2);
    setStockPriceChange({
      absolute: stockPriceAbsoluteChange.toFixed(2),
      percent: stockPricePercentChange,
    });

    // Assets for Borrowing Change
    const assetsForBorrowingLastWeek = assetData
      .filter(
        (asset) =>
          moment(asset.createdDate).isBefore(oneWeekAgo) && asset.is_active
      )
      .reduce((acc, asset) => acc + (asset.quantity_for_borrowing || 0), 0);
    const assetsForBorrowingCurrent = assetData.reduce(
      (acc, asset) =>
        asset.is_active ? acc + (asset.quantity_for_borrowing || 0) : acc,
      0
    );
    const assetsForBorrowingAbsoluteChange =
      assetsForBorrowingCurrent - assetsForBorrowingLastWeek;
    const assetsForBorrowingPercentChange = (
      (assetsForBorrowingAbsoluteChange / (assetsForBorrowingLastWeek || 1)) *
      100
    ).toFixed(2);
    setAssetsForBorrowingChange({
      absolute: assetsForBorrowingAbsoluteChange,
      percent: assetsForBorrowingPercentChange,
    });
  };

  const fetchAssets = async () => {
    try {
      // Get all assets
      const assetsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/Assets/read`
      );
      
      // Get all active issues
      const issuesResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/asset-issues`
      );

      // Filter out assets that have active issues
      const activeIssues = issuesResponse.data.filter(issue => 
        issue.status !== 'Resolved' && issue.status !== 'Completed'
      );
      
      const assetsWithActiveIssues = new Set(activeIssues.map(issue => issue.asset_id));

      // Filter assets that don't have active issues and aren't under repair
      const availableAssets = assetsResponse.data.filter(asset => 
        !assetsWithActiveIssues.has(asset.asset_id) && !asset.under_repair
      );

      setAssets(availableAssets);
      calculateTotals(availableAssets);
      calculateWeeklyChanges(availableAssets);
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
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/categories`
      );
      setCategories(response.data.map((cat) => cat.category_name));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/locations`
      );
      setLocations(response.data.map((loc) => loc.location_name));
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchTotalActiveAssets = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/assets/active/count`
      );
      setAssetsForBorrowing(response.data.count);
    } catch (error) {
      console.error("Error fetching total active assets:", error);
      setAssetsForBorrowing(0);
    }
  };

  const handleAddAsset = useCallback(async (newAsset) => {
    try {
      setAssets((prevAssets) => [...prevAssets, newAsset]);
      setIsModalOpen(false);
      showNotification("Asset added successfully");
    } catch (error) {
      console.error("Error adding asset:", error);
      showNotification("Error adding asset", "error");
    }
  }, []);

  const handleDeleteAsset = useCallback(async (assetId) => {
    try {
      if (!assetId) {
        return;
      }
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/Assets/delete/${assetId}`
      );
      if (response.status === 200) {
        setAssets((prevAssets) =>
          prevAssets.filter((asset) => asset.asset_id !== assetId)
        );
        showNotification("Asset deleted successfully");
      } else {
        throw new Error("Failed to delete asset");
      }
    } catch (error) {
      showNotification("Error deleting asset", "error");
    }
  }, []);

  const handleAddCategory = useCallback(async (newCategory) => {
    setCategories((prev) => [...prev, newCategory]);
    showNotification("Category added successfully");
  }, []);

  const handleDeleteCategory = useCallback(async (categoryToDelete) => {
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category !== categoryToDelete)
    );
    showNotification("Category deleted successfully");
    setAssets((prevAssets) =>
      prevAssets.map((asset) => {
        if (asset.selectedCategory === categoryToDelete) {
          return { ...asset, selectedCategory: "" };
        }
        return asset;
      })
    );
  }, []);

  const handleAddLocation = useCallback(async (newLocation) => {
    setLocations((prev) => [...prev, newLocation]);
    showNotification("Location added successfully");
  }, []);

  const handleDeleteLocation = useCallback(async (locationToDelete) => {
    setLocations((prevLocations) =>
      prevLocations.filter((location) => location !== locationToDelete)
    );
    showNotification("Location deleted successfully");
    setAssets((prevAssets) =>
      prevAssets.map((asset) => {
        if (asset.selectedLocation === locationToDelete) {
          return { ...asset, selectedLocation: "" };
        }
        return asset;
      })
    );
  }, []);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleSearch = useCallback((query) => setSearchQuery(query), []);

  const handleBorrowingChange = useCallback((newCount) => {
    setAssetsForBorrowing(newCount);
  }, []);

  const handleEditAsset = useCallback(
    (editedAsset, previousAsset) => {
      setAssets((prevAssets) =>
        prevAssets.map((asset) =>
          asset.asset_id === editedAsset.asset_id ? editedAsset : asset
        )
      );
      showNotification("Asset edited successfully");

      // Update assetsForBorrowing if the active status has changed
      if (editedAsset.is_active !== previousAsset.is_active) {
        handleBorrowingChange(previousAsset, editedAsset.is_active);
      }
    },
    [handleBorrowingChange]
  );

  const updateAssetQuantity = useCallback(async (assetId, newQuantity) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/Assets/updateQuantity/${assetId}`,
        {
          quantity: newQuantity,
        }
      );
      if (response.data.success) {
        setAssets((prevAssets) =>
          prevAssets.map((asset) =>
            asset.asset_id === assetId
              ? { ...asset, quantity: newQuantity }
              : asset
          )
        );
      } else {
        throw new Error(
          response.data.message || "Failed to update asset quantity"
        );
      }
    } catch (error) {
      console.error("Error updating asset quantity:", error);
      alert(
        `Error updating asset quantity: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(
      `${process.env.REACT_APP_API_URL}/api/assets/sse`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "assetQuantityUpdate") {
        setAssets((prevAssets) =>
          prevAssets.map((asset) =>
            asset.asset_id === data.assetId
              ? { ...asset, quantity: data.newQuantity }
              : asset
          )
        );
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const filteredAndSortedAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        const matchesSearch = asset.assetName.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (assetTypeFilter === 'all') return matchesSearch;
        if (assetTypeFilter === 'consumable') return matchesSearch && asset.type === 'Consumable';
        if (assetTypeFilter === 'non-consumable') return matchesSearch && asset.type === 'Non-Consumable';
        
        return matchesSearch;
      })
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
  }, [assets, searchQuery, sortCriteria, assetTypeFilter]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // Hide after 3 seconds
  };

  return (
    <div className="asset-list-container">
      {/* Summary Section: Total Assets, Stock Price, Assets for Borrowing */}
      <div className="bg-white rounded-lg  p-2 border border-gray-200 mb-4">
        <div className="flex divide-x divide-gray-200">
          {/* Total Assets */}
          <div className="flex-1 p-4">
            <h2 className="text-sm font-semibold text-gray-600">
              Total Assets
            </h2>
            <p className="text-4xl font-bold text-gray-800 mt-1">
              {totalAssets || "0"}
              <span className="text-sm text-black bg-[#FEC00F] rounded-full px-2 ml-2">
                +{totalAssetsChange} added
              </span>
            </p>
            <p className="text-gray-500 text-xs">vs previous 7 days</p>
            <div className="text-gray-400 mt-3 text-sm">Assets Count</div>
          </div>

          {/* Stock Price */}
          <div className="flex-1 p-4">
            <h2 className="text-sm font-semibold text-gray-600">Stock Price</h2>
            <p className="text-4xl font-bold text-gray-800 mt-1">
              ₱{stockPrice || "0.00"}
              <span className="text-sm text-black bg-[#FEC00F] rounded-full px-2 ml-2">
                +₱{stockPriceChange.absolute} ({stockPriceChange.percent}%)
              </span>
            </p>
            <p className="text-gray-500 text-xs">vs previous 7 days</p>
            <div className="text-gray-400 mt-3 text-sm">Total Value</div>
          </div>

          {/* Assets for Borrowing */}
          <div className="flex-1 p-4">
            <h2 className="text-sm font-semibold text-gray-600">
              Assets for Borrowing
            </h2>
            <p className="text-4xl font-bold text-gray-800 mt-1">
              {assetsForBorrowing || "0"}
              <span className="text-sm text-black bg-[#FEC00F] rounded-full px-2 ml-2">
                +{assetsForBorrowingChange.absolute} (
                {assetsForBorrowingChange.percent}%)
              </span>
            </p>
            <p className="text-gray-500 text-xs">vs previous 7 days</p>
            <div className="text-gray-400 mt-3 text-sm">Available for Use</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row justify-between items-center">
        {/* Search and Sort Controls */}
        <div className="flex flex-wrap w-full md:flex-nowrap md:w-auto justify-between items-center space-y-4 md:space-y-0 md:space-x-1">
          <div className="w-full md:w-auto flex-shrink-0">
            <AssetCategory
              onSaveCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              categories={categories}
            />
          </div>
          <div className="w-full md:w-auto flex-shrink-0">
            <AssetLocation
              onSaveLocation={handleAddLocation}
              onDeleteLocation={handleDeleteLocation}
              locations={locations}
            />
          </div>
          <div className="w-full md:w-auto flex-shrink-0">
            <AddAsset
              onAddAsset={handleAddAsset}
              categories={categories}
              locations={locations}
              isModalOpen={isModalOpen}
              onCloseModal={handleCloseModal}
              onOpenModal={handleOpenModal}
            />
          </div>
        </div>

        {/* Category, Location, and Add Asset Buttons */}
        <div className="flex flex-wrap w-full md:flex-nowrap md:w-auto justify-between items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-full md:w-auto flex-shrink-0">
            <AssetSearchbar handleSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <AssetTypeFilter
          selectedFilter={assetTypeFilter}
          onFilterChange={setAssetTypeFilter}
        />
      </div>

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
