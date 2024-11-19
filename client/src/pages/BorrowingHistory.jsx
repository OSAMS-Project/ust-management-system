import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faSearch } from "@fortawesome/free-solid-svg-icons";
import PaginationControls from '../components/assetlists/PaginationControls';
import { toast } from 'react-hot-toast';
import supabase from '../config/supabaseClient';

const BorrowingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log("Fetching history...");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/borrowing-requests/history`
        );
        console.log("History data received:", response.data);
        setHistory(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(`Failed to fetch borrowing history: ${err.message}`);
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Filter functions
  const filterByStatus = (record) => {
    if (statusFilter === "ALL") return true;
    return record.status === statusFilter;
  };

  const filterByDate = (record) => {
    if (dateFilter === "ALL") return true;
    const recordDate = moment(record.created_at);
    const today = moment();

    switch (dateFilter) {
      case "TODAY":
        return recordDate.isSame(today, "day");
      case "WEEK":
        return recordDate.isAfter(today.clone().subtract(1, "week"));
      case "MONTH":
        return recordDate.isAfter(today.clone().subtract(1, "month"));
      default:
        return true;
    }
  };

  const filterBySearch = (record) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      record.name.toLowerCase().includes(searchLower) ||
      record.email.toLowerCase().includes(searchLower) ||
      record.department.toLowerCase().includes(searchLower) ||
      record.borrowed_asset_names.toLowerCase().includes(searchLower)
    );
  };

  const filteredHistory = history.filter(
    (record) =>
      filterByStatus(record) && filterByDate(record) && filterBySearch(record)
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const calculateStartIndex = () => (currentPage - 1) * itemsPerPage + 1;
  const calculateEndIndex = () => Math.min(calculateStartIndex() + itemsPerPage - 1, filteredHistory.length);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    pageNumbers.push(
      ...Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index
      ).map((i) => (
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            i === currentPage
              ? "z-10 bg-[#FEC00F] text-black font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FEC00F]"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
          }`}
        >
          {i}
        </button>
      ))
    );

    return pageNumbers;
  };

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewCoverLetter = async (requestId) => {
    try {
      console.log('Opening cover letter for request ID:', requestId);
      
      // Use the API URL directly
      const coverLetterUrl = `${process.env.REACT_APP_API_URL}/api/borrowing-requests/${requestId}/cover-letter`;
      
      // Open the URL in a new tab
      window.open(coverLetterUrl, '_blank');
      
    } catch (error) {
      console.error('Error opening cover letter:', error);
      toast.error('Failed to open cover letter');
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-5xl font-extrabold text-black">
          Borrowing History
        </h1>
        <FontAwesomeIcon icon={faHistory} className="text-black text-4xl" />
      </div>

      {/* Add margin to the content container */}
      <div className="mx-6">
        {/* Utility Controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, email, department, or asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/4 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-yellow-500"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-yellow-500"
            >
              <option value="ALL">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Returned">Returned</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-yellow-500"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>
          </div>
        </div>

        {/* No Results Message */}
        {filteredHistory.length === 0 && (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              No records found matching your criteria
            </p>
          </div>
        )}

        {/* Table */}
        {filteredHistory.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse shadow-lg rounded-lg">
              <thead className="bg-black text-[#FEC00F]">
                <tr>
                  <th className="py-3 px-4 border-b text-center">Name</th>
                  <th className="py-3 px-4 border-b text-center">Email</th>
                  <th className="py-3 px-4 border-b text-center">Contact No.</th>
                  <th className="py-3 px-4 border-b text-center">Department</th>
                  <th className="py-3 px-4 border-b text-center">Purpose</th>
                  <th className="py-3 px-4 border-b text-center">Borrowed Asset</th>
                  <th className="py-3 px-4 border-b text-center">Quantity</th>
                  <th className="py-3 px-4 border-b text-center">Date Requested</th>
                  <th className="py-3 px-4 border-b text-center">Date Collected</th>
                  <th className="py-3 px-4 border-b text-center">Cover Letter</th>
                  <th className="py-3 px-4 border-b text-center">Expected Return Date</th>
                  <th className="py-3 px-4 border-b text-center">Actual Return Date</th>
                  <th className="py-3 px-4 border-b text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((record, index) => {
                  console.log('Record data:', record);
                  return (
                    <tr
                      key={record.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
                      } hover:bg-gray-50 transition duration-150`}
                    >
                      <td className="py-2 px-4 border-b text-center">
                        {record.name}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {record.email}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {record.contact_no}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {record.department}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {record.purpose}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {record.borrowed_asset_names}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {record.borrowed_asset_quantities}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {moment(record.date_requested).format("MM/DD/YYYY")}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {record.date_to_be_collected ? moment(record.date_to_be_collected).format("MM/DD/YYYY") : 'Not yet collected'}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {record.cover_letter_url ? (
                          <button
                            onClick={() => {
                              console.log('Clicked record:', record);
                              handleViewCoverLetter(record.id);
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            View Cover Letter
                          </button>
                        ) : (
                          "No cover letter"
                        )}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {moment(record.expected_return_date).format("MM/DD/YYYY")}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {record.status === "Rejected"
                          ? "N/A"
                          : record.status === "Returned" && record.date_returned
                          ? moment(record.date_returned).format("MM/DD/YYYY")
                          : "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            record.status === "Returned"
                              ? "bg-green-100 text-green-800"
                              : record.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredHistory.length > 0 && (
          <PaginationControls
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            calculateStartIndex={calculateStartIndex}
            calculateEndIndex={calculateEndIndex}
            totalItems={filteredHistory.length}
            renderPageNumbers={renderPageNumbers}
          />
        )}
      </div>
    </div>
  );
};

export default BorrowingHistory;
