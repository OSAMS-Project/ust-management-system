import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faSearch } from "@fortawesome/free-solid-svg-icons";
import PaginationControls from "../components/assetlists/PaginationControls";
import { toast } from "react-hot-toast";
import supabase from "../config/supabaseClient";

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
  const calculateEndIndex = () =>
    Math.min(calculateStartIndex() + itemsPerPage - 1, filteredHistory.length);
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

  const handleViewCoverLetter = async (record) => {
    try {
      console.log("Opening cover letter for request ID:", record.id);

      // First check if we have a valid URL
      if (!record.cover_letter_url) {
        toast.error("No cover letter available");
        return;
      }

      // If the URL is a full Supabase URL, open it directly
      if (record.cover_letter_url.startsWith("https://")) {
        window.open(record.cover_letter_url, "_blank");
        return;
      }

      // If it's a relative path in the samplebucket
      if (record.cover_letter_url.startsWith("cover_letters/")) {
        const { data, error } = await supabase.storage
          .from("samplebucket")
          .download(record.cover_letter_url);

        if (error) {
          console.error("Error downloading cover letter:", error);
          toast.error("Failed to download cover letter");
          return;
        }

        // Create a blob URL and open it
        const blob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");

        // Clean up the blob URL after opening
        setTimeout(() => URL.revokeObjectURL(url), 100);
        return;
      }

      // If it's an API endpoint path, use axios to fetch it
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests/${record.id}/cover-letter`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");

      // Clean up the blob URL after opening
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error opening cover letter:", error);
      toast.error("Failed to open cover letter");
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black">
          Borrowing History
        </h1>
        <FontAwesomeIcon
          icon={faHistory}
          className="text-black text-3xl sm:text-4xl"
        />
      </div>

      {/* Add margin to the content container */}
      <div className="mx-6">
        {/* Utility Controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white p-4">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name, email, department, or asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/2 md:w-1/4 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-yellow-500"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Status and Date Filters */}
          <div className="flex gap-4 sm:gap-6">
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
          <div className="text-center py-8 bg-white">
            <p className="text-gray-500">
              No records found matching your criteria
            </p>
          </div>
        )}

        {/* Table */}
        {filteredHistory.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead className="bg-black text-[#FEC00F]">
                <tr>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "10%" }}
                  >
                    Name
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "20%" }}
                  >
                    Borrowed Asset/s
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "15%" }}
                  >
                    Quantity
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "15%" }}
                  >
                    Department
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "15%" }}
                  >
                    Purpose
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "15%" }}
                  >
                    Email
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "15%" }}
                  >
                    Contact No.
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "10%" }}
                  >
                    Date Requested
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "10%" }}
                  >
                    Date Collected
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "10%" }}
                  >
                    Cover Letter
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "10%" }}
                  >
                    Expected Return Date
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "10%" }}
                  >
                    Actual Return Date
                  </th>
                  <th
                    className="py-2 px-3 border-b text-left whitespace-nowrap"
                    style={{ width: "10%" }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedHistory.map((record, index) => {
                  return (
                    <tr
                      key={record.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
                      } hover:bg-gray-50`}
                    >
                      <td className="py-2 px-4 border-b text-left">
                        {record.name}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {record.borrowed_asset_names}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {record.borrowed_asset_quantities}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {record.department}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {record.purpose}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {record.email}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {record.contact_no}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {moment(record.date_requested).format("MM/DD/YYYY")}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {record.date_to_be_collected
                          ? moment(record.date_to_be_collected).format(
                              "MM/DD/YYYY"
                            )
                          : "Not yet collected"}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {record.cover_letter_url ? (
                          <button
                            onClick={() => handleViewCoverLetter(record)}
                            className="text-blue-600 hover:underline"
                          >
                            View Cover Letter
                          </button>
                        ) : (
                          "No cover letter"
                        )}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {moment(record.expected_return_date).format(
                          "MM/DD/YYYY"
                        )}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        {record.status === "Rejected"
                          ? "N/A"
                          : record.status === "Returned" && record.date_returned
                          ? moment(record.date_returned).format("MM/DD/YYYY")
                          : "N/A"}
                      </td>
                      <td className="py-2 px-4 border-b text-left">
                        <span
                          className={`px-2 py-1 rounded ${
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

        {/* Pagination Controls */}
        {filteredHistory.length > 0 && (
          <div className="mt-4">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowingHistory;
