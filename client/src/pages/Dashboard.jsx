import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import DashboardInfoCards from "../components/dashboard/dashboardinfocards";
import StockPriceOverview from "../components/dashboard/StockPriceChart";
import BorrowerFrequencyChart from "../components/dashboard/BorrowerFrequencyChart";
import EventCompletionChart from "../components/dashboard/EventCompletionChart";
import UpcomingEvents from "../components/dashboard/UpcomingEvents";
import RecentlyAddedAssets from "../components/dashboard/RecentlyAddedAssets";

const Dashboard = () => {
  const [assets, setAssets] = useState([]);
  const [recentAssets, setRecentAssets] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [borrowedAssetsFrequency, setBorrowedAssetsFrequency] = useState({});
  const [completedEvents, setCompletedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // Use allEvents instead of upcomingEvents

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all required data in parallel
        const [
          assetsResponse,
          eventsResponse,
          completedEventsResponse,
          borrowedAssetsFrequencyResponse,
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/Assets/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/Events/read`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/events/completed`),
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/borrowing-requests/borrowed-assets-frequency`
          ),
        ]);

        // Process the fetched data
        const assets = assetsResponse.data;
        const allEvents = eventsResponse.data || [];
        const completedEvents = completedEventsResponse.data || [];
        const borrowedAssetsFrequency = borrowedAssetsFrequencyResponse.data;

        // Update the state once with all the data
        setAssets(assets);
        setRecentAssets(assets.slice(0, 3));
        calculateWeeklyStockHistory(assets);
        setAllEvents(allEvents);
        setRecentEvents(allEvents.slice(0, 3));
        setCompletedEvents(completedEvents);
        setBorrowedAssetsFrequency(borrowedAssetsFrequency);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateWeeklyStockHistory = (assetData) => {
    const historicalData = [];
    for (let i = 0; i < 8; i++) {
      const startOfWeek = moment().subtract(i, "weeks").startOf("week");
      const endOfWeek = moment().subtract(i, "weeks").endOf("week");

      const weeklyStockPrice = assetData
        .filter((asset) =>
          moment(asset.createdDate).isBetween(startOfWeek, endOfWeek)
        )
        .reduce((acc, asset) => acc + asset.cost * asset.quantity, 0);

      historicalData.push({
        date: startOfWeek.format("YYYY-MM-DD"),
        price: weeklyStockPrice,
      });
    }
    setStockHistory(historicalData.reverse());
  };

  const handleAssetDetailsClick = (asset) => {
    console.log("Asset details clicked:", asset);
  };

  const handleEventDetailsClick = (event) => {
    console.log("Event details clicked:", event);
  };

  return (
    <div className="p-6">
      {/* Dashboard Info Cards */}
      <DashboardInfoCards />

      {/* Charts Section */}
      <div className="inline-block bg-[#FEC00F] text-black font-bold rounded-full text-lg px-3 py-1 uppercase tracking-wide mt-2">
        Latest Reports
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 mt-1">
        {/* Stock Price Overview */}
        <div className="flex flex-col p-2">
          <StockPriceOverview stockData={stockHistory} />
        </div>

        {/* Event Completion Chart */}
        <div className="flex flex-col p-2">
          <EventCompletionChart
            completedEvents={completedEvents}
            allEvents={allEvents} // Pass allEvents here
          />
        </div>

        {/* Borrowed Assets Frequency Chart */}
        <div className="flex flex-col lg:col-span-2 p-2">
          <BorrowerFrequencyChart borrowerData={borrowedAssetsFrequency} />
        </div>
      </div>

      {/* Additional Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
        <UpcomingEvents
          sortedEvents={recentEvents}
          handleEventDetailsClick={handleEventDetailsClick}
        />
        <RecentlyAddedAssets
          recentAssets={recentAssets}
          handleAssetDetailsClick={handleAssetDetailsClick}
        />
      </div>
    </div>
  );
};

export default Dashboard;
