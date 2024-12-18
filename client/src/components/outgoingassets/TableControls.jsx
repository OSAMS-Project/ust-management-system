import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter, faFileDownload } from "@fortawesome/free-solid-svg-icons";
import ReportGenerator from './ReportGenerator';

const TableControls = ({ 
  searchTerm, 
  setSearchTerm, 
  dateRange, 
  setDateRange,
  selectedCategory,
  setSelectedCategory,
  categories,
  outgoingAssets 
}) => {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-4 justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          {/* Search Bar */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg pl-10"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium">Date Range:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border rounded-lg"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 items-center">
            <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Report Button */}
        <div>
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-black text-[#FEC00F] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <FontAwesomeIcon icon={faFileDownload} />
            Generate Report
          </button>
        </div>
      </div>

      {/* Report Generator Modal */}
      {showReportModal && (
        <ReportGenerator
          outgoingAssets={outgoingAssets}
          onClose={() => setShowReportModal(false)}
          dateRange={dateRange}
          selectedCategory={selectedCategory}
        />
      )}
    </div>
  );
};

export default TableControls; 