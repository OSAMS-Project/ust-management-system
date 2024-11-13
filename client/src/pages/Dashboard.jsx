import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import DashboardInfoCards from '../components/dashboard/dashboardinfocards';
import StockPriceChart from '../components/dashboard/StockPriceChart';
import BorrowerFrequencyChart from '../components/dashboard/BorrowerFrequencyChart';

const toSentenceCase = (str) => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const Dashboard = ({ user }) => {
  const [assets, setAssets] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [borrowerFrequency, setBorrowerFrequency] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const assetsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/Assets/read`);
        setAssets(assetsResponse.data);
        calculateWeeklyStockHistory(assetsResponse.data);

        const requestsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/borrowing-requests`);
        processBorrowerFrequency(requestsResponse.data);
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
        .filter((asset) => moment(asset.createdDate).isBetween(startOfWeek, endOfWeek))
        .reduce((acc, asset) => acc + asset.cost * asset.quantity, 0);

      historicalData.push({
        date: startOfWeek.format("YYYY-MM-DD"),
        price: weeklyStockPrice,
      });
    }
    setStockHistory(historicalData.reverse());
  };

  const processBorrowerFrequency = (requests) => {
    const frequency = requests.reduce((acc, request) => {
      acc[request.name] = (acc[request.name] || 0) + 1;
      return acc;
    }, {});
    setBorrowerFrequency(frequency);
  };

  return (
    <div className="p-8 min-h-screen">
      <div className="text-3xl mb-3">
        <span className="font-light">Welcome back,</span>{" "}
        <span className="font-bold">{toSentenceCase(user?.name || "User")}</span>
      </div>

      {/* Dashboard Info Cards */}
      <DashboardInfoCards />

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Price Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-3 text-center">Stock Price History</h2>
          <div className="flex-grow">
            <StockPriceChart stockData={stockHistory} />
          </div>
        </div>

        {/* Borrower Frequency Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold mb-3 text-center">Borrower Frequency</h2>
          <div className="flex-grow">
            <BorrowerFrequencyChart borrowerData={borrowerFrequency} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
