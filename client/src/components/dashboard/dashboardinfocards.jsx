import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import AssetDetailsModal from "../assetlists/AssetDetailsModal";
import EventDetailsModal from "../events/EventDetailsModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight, faBox, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

import { Link } from "react-router-dom";

const DashboardInfoCards = ({ formatTime }) => {
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

  return (
    <div>
      <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full text-2xl px-6 py-2 uppercase tracking-wide mb-4">
        SYSTEM SUMMARY
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
        <div
          className="bg-[#FEC00F] p-7 rounded-lg shadow-md flex items-center h-48 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-image.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-4">
              <h2 className="text-7xl font-extrabold text-[#FEC00F] drop-shadow-lg">
                {error
                  ? "Error"
                  : totalAssets === null
                  ? "Loading..."
                  : totalAssets}
              </h2>
              <p className="text-[1.25rem] font-semibold text-white drop-shadow-md">
                Total Assets
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
          className="bg-[#FEC00F] p-7 rounded-lg shadow-md flex items-center h-48 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-img-6.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-4">
              <h2 className="text-7xl font-extrabold text-[#FEC00F] drop-shadow-lg">
                {error
                  ? "Error"
                  : totalEvents === null
                  ? "Loading..."
                  : totalEvents}
              </h2>
              <p className="text-[1.25rem] font-semibold text-white drop-shadow-md">
                Total Events
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
          className="bg-[#FEC00F] p-7 rounded-lg shadow-md flex items-center h-48 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-img-5.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-4">
              <h2 className="text-7xl font-extrabold text-[#FEC00F] drop-shadow-lg">
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
          className="bg-[#FEC00F] p-7 rounded-lg shadow-md flex items-center h-48 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-img-5.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-4">
              <h2 className="text-7xl font-extrabold text-[#FEC00F] drop-shadow-lg">
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

        <div
          className="bg-[#FEC00F] p-7 rounded-lg shadow-md flex items-center h-48 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('ust-img-7.JPG')" }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col justify-between h-full w-3/4 text-left">
            <div className="p-4">
              <h2 className="text-7xl font-extrabold text-[#FEC00F] drop-shadow-lg">
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
      </div>
      
      {/* Recent Added Assets Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full text-2xl px-6 py-2 uppercase tracking-wide">
      Recently Added Assets
    </div>
    <div className="p-4 rounded-lg">
      {recentAssets.slice(0, 3).map((asset, index) => (
        <div
          key={asset.asset_id}
          className={`py-1 ${
            index < recentAssets.slice(0, 3).length - 1 ? "border-b" : ""
          } border-gray-200`}
        >
          <div className="flex items-center space-x-4">
            {/* Box Icon for the asset */}
            <FontAwesomeIcon icon={faBox} className="text-black text-2xl" />
            <div className="flex justify-between items-center w-full">
              <div>
                <p className="text-sm text-gray-400">
                  {moment(asset.createdDate).format("MMMM D, YYYY, h:mmA")}
                </p>
                <p className="font-bold text-2xl">{asset.assetName}</p>
                <p className="text-sm text-gray-500 mb-1">{asset.assetDetails}</p>
              </div>
              <button
                className="bg-black text-white px-3 py-1 rounded-full flex items-center"
                onClick={() => handleAssetDetailsClick(asset)}
              >
                <FontAwesomeIcon icon={faEye} className="mr-2" />
                View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>


        {/* Recent Events */}
       <div>
  <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full text-2xl px-6 py-2 uppercase tracking-wide">
    Upcoming Events
  </div>
  <div className="p-4 rounded-lg">
    {sortedEvents.slice(0, 3).map((event, index) => (
      <div
        key={event.unique_id}
        className={`py-1 ${
          index < sortedEvents.slice(0, 3).length - 1 ? "border-b" : ""
        } border-gray-200`}
      >
        <div className="flex items-center space-x-4">
          {/* Calendar Icon for the event */}
          <FontAwesomeIcon icon={faCalendarAlt} className="text-black text-2xl" />
          <div className="flex justify-between items-center w-full">
            <div>
              <p className="text-sm text-gray-400">
                {moment(event.event_date).format("MMMM D, YYYY")}{" "}
                {formatTime(event.event_start_time)} -{" "}
                {formatTime(event.event_end_time)}
              </p>
              <p className="font-bold text-2xl">{event.event_name}</p>
              <p className="text-sm text-gray-500 mb-1">{event.description}</p>
            </div>
            <button
              className="bg-black text-white px-3 py-1 rounded-full flex items-center"
              onClick={() => handleEventDetailsClick(event)}
            >
              <FontAwesomeIcon icon={faEye} className="mr-2" />
              View
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

      </div>

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
    </div>
  );
};

export default DashboardInfoCards;
