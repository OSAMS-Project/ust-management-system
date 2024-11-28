import React, { useState } from "react";
import CompletedExploreModal from "./CompletedExploreEvent";
import PaginationControls from "../assetlists/PaginationControls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretLeft,
  faCaretRight,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

const CompletedEvents = ({ completedEvents }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "event_date",
    direction: "desc",
  });

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return <FontAwesomeIcon icon={faSort} className="ml-2 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} className="ml-2 text-yellow-500" />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className="ml-2 text-yellow-500" />
    );
  };

  const sortedEvents = [...completedEvents].sort((a, b) => {
    if (sortConfig.key === "event_date") {
      const dateA = new Date(a.event_date);
      const dateB = new Date(b.event_date);
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (
      sortConfig.key === "event_name" ||
      sortConfig.key === "event_location"
    ) {
      const valueA = a[sortConfig.key].toLowerCase();
      const valueB = b[sortConfig.key].toLowerCase();
      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    }
    return 0;
  });

  const handleRowClick = (event) => {
    setSelectedEvent(event);
    setShowExploreModal(true);
  };

  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const calculateStartIndex = () => {
    return (currentPage - 1) * itemsPerPage + 1;
  };

  const calculateEndIndex = () => {
    return Math.min(currentPage * itemsPerPage, sortedEvents.length);
  };

  const totalPages = Math.ceil(sortedEvents.length / itemsPerPage);

  const renderPageNumbers = () => {
    let pages = [];
    const maxVisiblePages = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
            currentPage === i
              ? "z-10 bg-yellow-500 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="mb-16">
      {sortedEvents.length === 0 ? (
        <p>No completed events to display.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead className="bg-black text-[#FEC00F]">
                <tr>
                  <th
                    className="py-2 px-4 border-b text-center cursor-pointer hover:bg-gray-900"
                    onClick={() => handleSort("event_name")}
                  >
                    Event Name {getSortIcon("event_name")}
                  </th>
                  <th
                    className="py-2 px-4 border-b text-center cursor-pointer hover:bg-gray-900"
                    onClick={() => handleSort("event_date")}
                  >
                    Event Date {getSortIcon("event_date")}
                  </th>
                  <th className="py-2 px-4 border-b text-center">Event Time</th>
                  <th
                    className="py-2 px-4 border-b text-center cursor-pointer hover:bg-gray-900"
                    onClick={() => handleSort("event_location")}
                  >
                    Location {getSortIcon("event_location")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentEvents.map((event, index) => (
                  <tr
                    key={event.unique_id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    } cursor-pointer hover:bg-gray-200`}
                    onClick={() => handleRowClick(event)}
                  >
                    <td className="py-2 px-4 border-b text-center">
                      {event.event_name}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {new Date(event.event_date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {formatTime(event.event_start_time)} -{" "}
                      {formatTime(event.event_end_time)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">
                      {event.event_location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            itemsPerPage={itemsPerPage}
            handleItemsPerPageChange={handleItemsPerPageChange}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            calculateStartIndex={calculateStartIndex}
            calculateEndIndex={calculateEndIndex}
            totalItems={sortedEvents.length}
            renderPageNumbers={renderPageNumbers}
          />
        </>
      )}

      <CompletedExploreModal
        showExploreModal={showExploreModal}
        selectedEvent={selectedEvent}
        setShowExploreModal={setShowExploreModal}
      />
    </div>
  );
};

export default CompletedEvents;
