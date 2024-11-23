import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import AssetDetailsModal from "../assetlists/AssetDetailsModal";
import EventDetailsModal from "../events/EventDetailsModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import { Link } from "react-router-dom";
import ExploreModal from '../events/ExploreEvent';

const DashboardInfoCards = () => {
  const [totalAssets, setTotalAssets] = useState(null);
  const [totalEvents, setTotalEvents] = useState(null);
  const [totalAssetsForBorrowing, setTotalAssetsForBorrowing] = useState(null);
  const [totalPendingRequests, setTotalPendingRequests] = useState(null);
  const [totalAcceptedRequests, setTotalAcceptedRequests] = useState(null);
  const [recentAssets, setRecentAssets] = useState([]);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [totalOngoingEvents, setTotalOngoingEvents] = useState(null);
  const [repairRecords, setRepairRecords] = useState([]);
  const [totalOngoingRepairs, setTotalOngoingRepairs] = useState(null);
  const [totalIncomingAssets, setTotalIncomingAssets] = useState(null);
  const [showExploreModal, setShowExploreModal] = useState(false);

  const formatTime = (time) => {
    if (!time) return "";

    // Assuming time is in HH:mm format (24-hour)
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    return date
      .toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase(); // Returns format like "2:30 pm"
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assetsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/dashboard/total-assets`
        );
        setTotalAssets(assetsResponse.data.totalAssets);

        const eventsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/dashboard/total-events`
        );
        setTotalEvents(eventsResponse.data.totalEvents);

        const assetsForBorrowingResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/dashboard/total-assets-for-borrowing`
        );
        setTotalAssetsForBorrowing(
          assetsForBorrowingResponse.data.totalAssetsForBorrowing
        );

        const pendingRequestsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/dashboard/total-pending-requests`
        );
        setTotalPendingRequests(
          pendingRequestsResponse.data.totalPendingRequests
        );

        const acceptedRequestsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/dashboard/total-accepted-requests`
        );
        setTotalAcceptedRequests(
          acceptedRequestsResponse.data.totalAcceptedRequests
        );

        const recentAssetsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/dashboard/recent-assets`
        );
        setRecentAssets(recentAssetsResponse.data);

        const incomingAssetsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/dashboard/total-incoming-assets`
        );
        setTotalIncomingAssets(incomingAssetsResponse.data.totalIncomingAssets);

        const repairRecordsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/dashboard/total-repairs`
        );
        setTotalOngoingRepairs(repairRecordsResponse.data.totalOngoingRepairs);

        const recentEventsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/dashboard/recent-events`
        );
        setRecentEvents(recentEventsResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to fetch dashboard data");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/dashboard/total-events`
        );
        setTotalOngoingEvents(response.data.totalEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(true);
      }
    };

    fetchEvents();
  }, []);

  const handleAssetDetailsClick = async (asset) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/Assets/read`
      );
      const allAssets = response.data;
      const selectedAsset = allAssets.find(
        (a) => a.asset_id === asset.asset_id
      );

      if (selectedAsset) {
        setSelectedAsset(selectedAsset);
      } else {
        console.error("Asset not found");
      }
    } catch (error) {
      console.error("Error fetching asset details:", error);
    }
  };

  const handleEventDetailsClick = (event) => {
    setSelectedEvent(event);
    // You might want to open a modal or navigate to a details page here
  };

  const upcomingEvents = recentEvents.filter((event) => !event.is_completed);
  const sortedEvents = [...upcomingEvents].sort((a, b) => {
    const dateTimeA = moment(
      `${a.event_date} ${a.event_start_time}`,
      "YYYY-MM-DD HH:mm"
    );
    const dateTimeB = moment(
      `${b.event_date} ${b.event_start_time}`,
      "YYYY-MM-DD HH:mm"
    );
    return dateTimeA.valueOf() - dateTimeB.valueOf();
  });

  const handleExplore = async (event) => {
    try {
      // Fetch complete event data including assets
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events/${event.unique_id}`);
      const eventWithAssets = response.data;
      
      console.log('Fetched event data:', eventWithAssets); // Debug log
      
      // Make sure assets property exists
      if (!eventWithAssets.assets) {
        eventWithAssets.assets = [];
      }
      
      setSelectedEvent(eventWithAssets);
      setShowExploreModal(true);
    } catch (error) {
      console.error('Error fetching event details:', error);
      alert('Failed to load event details');
    }
  };

  return (
    <div>
      <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full text-lg px-3 py-1 uppercase tracking-wide mb-3">
        SYSTEM SUMMARY
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 px-2">
        <div
          className="bg-[#FEC00F] p-5 rounded-lg shadow-md flex items-center h-36 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-image.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-3">
              <h2 className="text-5xl font-extrabold text-[#FEC00F] drop-shadow-lg">
                {error
                  ? "Error"
                  : totalAssets === null
                  ? "Loading..."
                  : totalAssets}
              </h2>
              <p className="text-base font-semibold text-white drop-shadow-md">
                Total Assets
              </p>
            </div>
          </div>
          <div className="absolute bottom-3 right-3">
            <Link
              to="/assets"
              className="bg-gray-100 text-black py-1 px-2 rounded-full font-medium text-xs hover:bg-gray-400 transition duration-300"
            >
              See More
              <FontAwesomeIcon icon={faArrowRight} className="ml-1 text-sm" />
            </Link>
          </div>
        </div>

        <div
          className="bg-[#FEC00F] p-5 rounded-lg shadow-md flex items-center h-36 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-img-6.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-3">
              <h2 className="text-5xl font-extrabold text-[#FEC00F] drop-shadow-lg">
                {error
                  ? "Error"
                  : totalOngoingEvents === null
                  ? "Loading..."
                  : totalOngoingEvents}
              </h2>
              <p className="text-[1.25rem] font-semibold text-white drop-shadow-md">
                Ongoing Events
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <Link
              to="/events"
              className="bg-gray-100 text-black py-1 px-3 rounded-full font-medium text-sm hover:bg-gray-400 transition duration-300"
            >
              See More
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-sm" />
            </Link>
          </div>
        </div>

        <div
          className="bg-[#FEC00F] p-5 rounded-lg shadow-md flex items-center h-36 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-img-5.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-3">
              <h2 className="text-5xl font-extrabold text-[#FEC00F] drop-shadow-lg">
                {error
                  ? "Error"
                  : totalAssetsForBorrowing === null
                  ? "Loading..."
                  : totalAssetsForBorrowing}
              </h2>
              <p className="text-[1.25rem] font-semibold text-white drop-shadow-md">
                Total Assets for Borrowing
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <Link
              to="/assets"
              className="bg-gray-100 text-black py-1 px-3 rounded-full font-medium text-sm hover:bg-gray-400 transition duration-300"
            >
              See More
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-sm" />
            </Link>
          </div>
        </div>

        <div
          className="bg-[#FEC00F] p-5 rounded-lg shadow-md flex items-center h-36 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-img-5.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-3">
              <h2 className="text-5xl font-extrabold text-[#FEC00F] drop-shadow-lg">
                {error
                  ? "Error"
                  : totalPendingRequests === null
                  ? "Loading..."
                  : totalPendingRequests}
              </h2>
              <p className="text-[1.25rem] font-semibold text-white drop-shadow-md">
                Pending Borrowing Requests
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <Link
              to="/borrowingrequest"
              className="bg-gray-100 text-black py-1 px-3 rounded-full font-medium text-sm hover:bg-gray-400 transition duration-300"
            >
              See More
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-sm" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 px-2 py-1">
        <div
          className="bg-[#FEC00F] p-5 rounded-lg shadow-md flex items-center h-36 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-img-7.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-3">
              <h2 className="text-5xl font-extrabold text-[#FEC00F] drop-shadow-lg">
                {error
                  ? "Error"
                  : totalAcceptedRequests === null
                  ? "Loading..."
                  : totalAcceptedRequests}
              </h2>
              <p className="text-[1.25rem] font-semibold text-white drop-shadow-md">
                Accepted Borrowing Requests
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <Link
              to="/borrowingrequest"
              className="bg-gray-100 text-black py-1 px-3 rounded-full font-medium text-sm hover:bg-gray-400 transition duration-300"
            >
              See More
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-sm" />
            </Link>
          </div>
        </div>
        <div
          className="bg-[#FEC00F] p-5 rounded-lg shadow-md flex items-center h-36 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-img-6.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-3">
              <h2 className="text-5xl font-extrabold text-[#FEC00F] drop-shadow-lg">
                {error
                  ? "Error"
                  : totalIncomingAssets === null
                  ? "Loading..."
                  : totalIncomingAssets}
              </h2>
              <p className="text-[1.25rem] font-semibold text-white drop-shadow-md">
                Incoming Assets
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <Link
              to="/events"
              className="bg-gray-100 text-black py-1 px-3 rounded-full font-medium text-sm hover:bg-gray-400 transition duration-300"
            >
              See More
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-sm" />
            </Link>
          </div>
        </div>
        <div
          className="bg-[#FEC00F] p-5 rounded-lg shadow-md flex items-center h-36 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-img-6.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-3">
              <h2 className="text-5xl font-extrabold text-[#FEC00F] drop-shadow-lg">
                {error
                  ? "Error"
                  : totalOngoingEvents === null
                  ? "Loading..."
                  : totalOngoingEvents}
              </h2>
              <p className="text-[1.25rem] font-semibold text-white drop-shadow-md">
                Ongoing Asset Repairs
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <Link
              to="/events"
              className="bg-gray-100 text-black py-1 px-3 rounded-full font-medium text-sm hover:bg-gray-400 transition duration-300"
            >
              See More
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-sm" />
            </Link>
          </div>
        </div>
      </div>
      {/* Recent Added Assets Section */}

      {selectedAsset && (
        <AssetDetailsModal
          selectedAsset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}
      {selectedEvent && (
        <EventDetailsModal
          selectedEvent={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          formatTime={formatTime}
        />
      )}
      {showExploreModal && selectedEvent && (
        <ExploreModal
          showExploreModal={showExploreModal}
          setShowExploreModal={setShowExploreModal}
          selectedEvent={selectedEvent}
          handleAddAsset={() => {}}
          updateEventAssets={() => {}}
          updateAssetQuantity={() => {}}
        />
      )}
    </div>
  );
};

export default DashboardInfoCards;
