import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faSearch } from "@fortawesome/free-solid-svg-icons";

const BorrowingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log('Fetching history...');
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/borrowing-requests/history`
        );
        console.log('History data received:', response.data);
        setHistory(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching history:', err);
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
        return recordDate.isSame(today, 'day');
      case "WEEK":
        return recordDate.isAfter(today.clone().subtract(1, 'week'));
      case "MONTH":
        return recordDate.isAfter(today.clone().subtract(1, 'month'));
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

  const filteredHistory = history.filter(record => 
    filterByStatus(record) && filterByDate(record) && filterBySearch(record)
  );

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  
  return (
    <div className="container mx-auto px-6">
      <div className="bg-[#FEC00F] py-6 flex items-center justify-between px-6 mb-6">
        <h1 className="text-4xl font-extrabold text-black">
          Borrowing History
        </h1>
        <FontAwesomeIcon icon={faHistory} className="text-black text-4xl" />
      </div>

      {/* Utility Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name, email, department, or asset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-yellow-500"
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
          <p className="text-gray-500">No records found matching your criteria</p>
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
                <th className="py-3 px-4 border-b text-center">Cover Letter</th>
                <th className="py-3 px-4 border-b text-center">Expected Return Date</th>
                <th className="py-3 px-4 border-b text-center">Actual Return Date</th>
                <th className="py-3 px-4 border-b text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((record, index) => (
                <tr
                  key={record.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-[#E8E8E8]"
                  } hover:bg-gray-50 transition duration-150`}
                >
                  <td className="py-2 px-4 border-b text-center">{record.name}</td>
                  <td className="py-2 px-4 border-b text-center">{record.email}</td>
                  <td className="py-2 px-4 border-b text-center">{record.contact_no}</td>
                  <td className="py-2 px-4 border-b text-center">{record.department}</td>
                  <td className="py-2 px-4 border-b text-center">{record.purpose}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {record.borrowed_asset_names}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {record.borrowed_asset_quantities}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {record.cover_letter_url ? (
                      <a
                        href={`${process.env.REACT_APP_API_URL}${record.cover_letter_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Cover Letter
                      </a>
                    ) : (
                      "No cover letter"
                    )}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {moment(record.expected_return_date).format("MMMM Do YYYY")}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {record.status === "Rejected" ? (
                      "N/A"
                    ) : record.status === "Returned" && record.date_returned ? (
                      moment(record.date_returned).format("MMMM Do YYYY, h:mm:ss a")
                    ) : (
                      "N/A"
                    )}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BorrowingHistory; 