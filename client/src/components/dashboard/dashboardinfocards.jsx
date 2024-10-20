import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import AssetDetailsModal from "../assetlists/assetdetailsmodal";
import EventDetailsModal from "../events/eventdetailsmodal";

const DashboardInfoCards = ({ formatTime }) => {
  const [totalAssets, setTotalAssets] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
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
        const assetsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/total-assets`);
        setTotalAssets(assetsResponse.data.totalAssets);

        const usersResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/total-users`);
        setTotalUsers(usersResponse.data.totalUsers);

        const eventsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/total-events`);
        setTotalEvents(eventsResponse.data.totalEvents);

        // const assetsForBorrowingResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/total-assets-for-borrowing`);
        // setTotalAssetsForBorrowing(assetsForBorrowingResponse.data.totalAssetsForBorrowing);

        // const pendingRequestsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/total-pending-requests`);
        // setTotalPendingRequests(pendingRequestsResponse.data.totalPendingRequests);

        // const acceptedRequestsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/total-accepted-requests`);
        // setTotalAcceptedRequests(acceptedRequestsResponse.data.totalAcceptedRequests);

        const recentAssetsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/recent-assets`);
        setRecentAssets(recentAssetsResponse.data);

        const recentEventsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard/recent-events`);
        setRecentEvents(recentEventsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to fetch dashboard data');
      }
    };

    fetchData();
  }, []);

  const handleAssetDetailsClick = async (asset) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Assets/read`);
      const allAssets = response.data;
      const selectedAsset = allAssets.find(a => a.asset_id === asset.asset_id);
      
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

  const now = moment();
  const upcomingEvents = recentEvents.filter(event => !event.is_completed);
  const sortedEvents = [...upcomingEvents].sort((a, b) => {
    const dateTimeA = moment(`${a.event_date} ${a.event_start_time}`, 'YYYY-MM-DD HH:mm');
    const dateTimeB = moment(`${b.event_date} ${b.event_start_time}`, 'YYYY-MM-DD HH:mm');
    return dateTimeA.valueOf() - dateTimeB.valueOf();
  });

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-400 p-6 rounded-lg shadow-md flex items-center justify-center h-48 bg-cover bg-center relative overflow-hidden" style={{backgroundImage: "url('ust-image.jpg')"}}>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-7xl font-bold text-yellow-400">
              {error ? 'Error' : totalAssets === null ? 'Loading...' : totalAssets}
            </h2>
            <p className="text-2xl font-semibold text-white mt-2">Total Assets</p>
          </div>
        </div>

        <div className="bg-yellow-400 p-6 rounded-lg shadow-md flex items-center justify-center h-48 bg-cover bg-center relative overflow-hidden" style={{backgroundImage: "url('ust-image.jpg')"}}>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-7xl font-bold text-yellow-400">
              {error ? 'Error' : totalUsers === null ? 'Loading...' : totalUsers}
            </h2>
            <p className="text-2xl font-semibold text-white mt-2">Total Users</p>
          </div>
        </div>

        <div className="bg-yellow-400 p-6 rounded-lg shadow-md flex items-center justify-center h-48 bg-cover bg-center relative overflow-hidden" style={{backgroundImage: "url('ust-image.jpg')"}}>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-7xl font-bold text-yellow-400">
              {error ? 'Error' : totalEvents === null ? 'Loading...' : totalEvents}
            </h2>
            <p className="text-2xl font-semibold text-white mt-2">Total Events</p>
          </div>
        </div>
{/* 
        <div className="bg-yellow-400 p-6 rounded-lg shadow-md flex items-center justify-center h-48 bg-cover bg-center relative overflow-hidden" style={{backgroundImage: "url('ust-image.jpg')"}}>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-7xl font-bold text-yellow-400">
              {error ? 'Error' : totalAssetsForBorrowing === null ? 'Loading...' : totalAssetsForBorrowing}
            </h2>
            <p className="text-2xl font-semibold text-white mt-2">Total Assets for Borrowing</p>
          </div>
        </div>

        <div className="bg-yellow-400 p-6 rounded-lg shadow-md flex items-center justify-center h-48 bg-cover bg-center relative overflow-hidden" style={{backgroundImage: "url('ust-image.jpg')"}}>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-7xl font-bold text-yellow-400">
              {error ? 'Error' : totalPendingRequests === null ? 'Loading...' : totalPendingRequests}
            </h2>
            <p className="text-2xl font-semibold text-white mt-2">Pending Borrowing Requests</p>
          </div>
        </div>

        <div className="bg-yellow-400 p-6 rounded-lg shadow-md flex items-center justify-center h-48 bg-cover bg-center relative overflow-hidden" style={{backgroundImage: "url('ust-image.jpg')"}}>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-7xl font-bold text-yellow-400">
              {error ? 'Error' : totalAcceptedRequests === null ? 'Loading...' : totalAcceptedRequests}
            </h2>
            <p className="text-2xl font-semibold text-white mt-2">Accepted Borrowing Requests</p>
          </div>
        </div> */}
      </div>

      {/* Recent Added Assets Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Recently Added Assets</h2>
          <div className="space-y-4">
            {recentAssets.slice(0, 3).map((asset) => (
              <div key={asset.asset_id} className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{asset.assetName}</p>
                  <p className="text-sm text-gray-500">
                    {moment(asset.createdDate).format('MMMM D, YYYY, h:mmA')}
                  </p>
                </div>
                <button 
                  className="bg-yellow-500 text-white px-4 py-1 rounded-full"
                  onClick={() => handleAssetDetailsClick(asset)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

                {/* Recent Events */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                <div className="space-y-4">
                  {sortedEvents.slice(0, 3).map((event) => (
                    <div key={event.unique_id} className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">{event.event_name}</p>
                        <p className="text-sm text-gray-500">
                          {moment(event.event_date).format('MMMM D, YYYY')} {formatTime(event.event_start_time)} - {formatTime(event.event_end_time)}
                        </p>
                      </div>
                      <button 
                        className="bg-yellow-500 text-white px-4 py-1 rounded-full"
                        onClick={() => handleEventDetailsClick(event)}
                      >
                  View
                </button>
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
