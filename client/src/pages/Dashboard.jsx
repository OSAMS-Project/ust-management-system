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

  const [totalEvents, setTotalEvents] = useState(0);
  const [completedEvents, setCompletedEvents] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const assetsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/Assets/read`
        );
        setAssets(assetsResponse.data);
        setRecentAssets(assetsResponse.data.slice(0, 3));
        calculateWeeklyStockHistory(assetsResponse.data);

        const eventsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/Events/read`
        );
        setRecentEvents(eventsResponse.data.slice(0, 3));
        setTotalEvents(eventsResponse.data.length);

        const completedEventsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/events/completed`
        );
        setCompletedEvents(completedEventsResponse.data || []);

        const fetchBorrowedAssetsFrequency = async () => {
          try {
            const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/borrowing-requests/borrowed-assets-frequency`
            );
            setBorrowedAssetsFrequency(response.data);
          } catch (error) {
            console.error("Error fetching borrowed assets frequency:", error);
          }
        };
        fetchBorrowedAssetsFrequency();
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
      {/* Welcome Section */}

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
            totalEvents={totalEvents}
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
