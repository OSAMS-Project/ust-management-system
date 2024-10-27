import React from 'react';
import { formatTime } from '../utils/formatTime';
import DashboardInfoCards from '../components/dashboard/dashboardinfocards';


const toSentenceCase = (str) => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const Dashboard = ({ user }) => {
  return (
    <div className="p-12 min-h-screen">
      <div className="text-4xl mb-4">
        <span className="font-light">Welcome back,</span> <span className="font-bold">{toSentenceCase(user?.name || "User")}</span>
      </div>

      {/* Ticket Summary Section */}
      <DashboardInfoCards formatTime={formatTime} />

    </div>
  );
};

export default Dashboard;
