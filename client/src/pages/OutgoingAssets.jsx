import React, { useState, useEffect } from 'react';
import OutgoingAssetsTable from '../components/outgoingassets/OutgoingAssetsTable';
import TableControls from '../components/outgoingassets/TableControls';
import axios from 'axios';
import moment from 'moment';

const OutgoingAssets = () => {
  const [outgoingAssets, setOutgoingAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table control states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'consumed_date',
    direction: 'desc'
  });

  // Get unique categories from assets
  const categories = [...new Set(outgoingAssets.map(asset => asset.category))];

  useEffect(() => {
    const fetchOutgoingAssets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/outgoing-assets`);
        setOutgoingAssets(response.data);
        setFilteredAssets(response.data);
      } catch (err) {
        console.error('Error details:', err);
        setError(err.response?.data?.error || 'Failed to fetch outgoing assets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOutgoingAssets();
  }, []);

  // Filter and sort assets
  useEffect(() => {
    let filtered = [...outgoingAssets];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.assetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(asset => {
        const consumedDate = moment(asset.consumed_date);
        return consumedDate.isBetween(dateRange.start, dateRange.end, 'day', '[]');
      });
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredAssets(filtered);
  }, [outgoingAssets, searchTerm, dateRange, selectedCategory, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-8 text-red-500">
      <p className="text-xl font-semibold">{error}</p>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Outgoing Assets</h1>
        <p className="text-gray-600">Track all consumed assets and their details</p>
      </div>
      <TableControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        outgoingAssets={filteredAssets}
      />
      <OutgoingAssetsTable
        outgoingAssets={filteredAssets}
        sortConfig={sortConfig}
        onSort={handleSort}
      />
    </div>
  );
};

export default OutgoingAssets;
