import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import AssetDetailsModal from "../assetlists/AssetDetailsModal";
import EventDetailsModal from "../events/EventDetailsModal";
import ExploreModal from '../events/ExploreEvent';

const DashboardInfoCards = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showExploreModal, setShowExploreModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/dashboard-data`);
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to fetch dashboard data");
      }
    };
    fetchDashboardData();
  }, []);

  const handleAssetDetailsClick = async (asset) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Assets/read`);
      const allAssets = response.data;
      const selectedAsset = allAssets.find((a) => a.asset_id === asset.asset_id);

      if (selectedAsset) {
        setSelectedAsset(selectedAsset);
      } else {
        console.error("Asset not found");
      }
    } catch (error) {
      console.error("Error fetching asset details:", error);
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
                {error ? "Error" : dashboardData.totalAssets === undefined ? "0" : dashboardData.totalAssets}
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
                {error ? "Error" : dashboardData.totalEvents === undefined ? "0" : dashboardData.totalEvents}
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
                {error ? "Error" : dashboardData.totalAssetsForBorrowing === undefined ? "0" : dashboardData.totalAssetsForBorrowing}
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
                {error ? "Error" : dashboardData.totalPendingRequests === undefined ? "0" : dashboardData.totalPendingRequests}
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
                {error ? "Error" : dashboardData.totalAcceptedRequests === undefined ? "0" : dashboardData.totalAcceptedRequests}
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
                {error ? "Error" : dashboardData.totalIncomingAssets === undefined ? "0" : dashboardData.totalIncomingAssets}
              </h2>
              <p className="text-[1.25rem] font-semibold text-white drop-shadow-md">
                Incoming Assets
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <Link
              to="/incoming-assets"
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
                {error ? "Error" : dashboardData.totalRepairs === undefined ? "0" : dashboardData.totalRepairs}
              </h2>
              <p className="text-[1.25rem] font-semibold text-white drop-shadow-md">
                Ongoing Asset Repairs
              </p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <Link
              to="/asset-repair"
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