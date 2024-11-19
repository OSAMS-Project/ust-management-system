import React, { useState, useEffect } from 'react';
import moment from 'moment';

const TIMER_DURATION = {
  TESTING: 30, // 30 seconds for testing
  PRODUCTION: 7 * 24 * 60 * 60 // 7 days in seconds
};

const IS_TESTING = false; // Set to false when deploying to production

const AssetRequestTable = ({ assetRequests, onApprove, onDecline }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Initialize timers for new requests
  useEffect(() => {
    const newTimeLeft = {};
    assetRequests.forEach(asset => {
      const createdDate = moment(asset.created_at);
      const duration = IS_TESTING ? TIMER_DURATION.TESTING : TIMER_DURATION.PRODUCTION;
      const expiryDate = moment(createdDate).add(duration, IS_TESTING ? 'seconds' : 'seconds');
      const remaining = Math.max(0, expiryDate.diff(moment(), 'seconds'));
      newTimeLeft[asset.id] = remaining;
    });
    setTimeLeft(newTimeLeft);
  }, [assetRequests]);

  // Handle countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTimeLeft = { ...prev };
        let hasChanges = false;

        Object.entries(newTimeLeft).forEach(([id, time]) => {
          if (time > 0) {
            newTimeLeft[id] = time - 1;
            hasChanges = true;

            if (IS_TESTING && time <= 5) {
              console.log(`Request ${id} time remaining: ${time - 1} seconds`);
            }

            // Check if timer just expired
            if (newTimeLeft[id] === 0) {
              console.log(`Timer expired for request ${id}! Auto-declining...`);
              const request = assetRequests.find(req => req.id === parseInt(id));
              if (request) {
                onDecline({
                  ...request,
                  auto_declined: true,
                  status: 'declined',
                  declined_at: new Date().toISOString()
                });
              }
            }
          }
        });

        return hasChanges ? newTimeLeft : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [assetRequests, onDecline]);

  // Format the time remaining to show days, hours, minutes, and seconds
  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return "Expired";
    
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  return (
    <div className="mt-2 mb-8">
      <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>
      <table className="min-w-full bg-white border-collapse">
        <thead className="bg-black text-[#FEC00F]">
          <tr>
            <th className="py-2 px-4 border-b text-center">Asset Name</th>
            <th className="py-2 px-4 border-b text-center">Quantity</th>
            <th className="py-2 px-4 border-b text-center">Date Requested</th>
            <th className="py-2 px-4 border-b text-center">Requested By</th>
            <th className="py-2 px-4 border-b text-center">Time Remaining</th>
            <th className="py-2 px-4 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assetRequests.map((asset) => (
            <tr key={asset.id}>
              <td className="py-2 px-4 border-b text-center">{asset.asset_name}</td>
              <td className="py-2 px-4 border-b text-center">{asset.quantity}</td>
              <td className="py-2 px-4 border-b text-center">
                {moment(asset.created_at).format('MM/DD/YYYY')}
              </td>
              <td className="py-2 px-4 border-b text-center">
                <div className="flex items-center justify-center">
                  <img
                    src={asset.user_picture || "https://via.placeholder.com/30"}
                    alt={asset.created_by}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  {asset.created_by}
                </div>
              </td>
              <td className="py-2 px-4 border-b text-center">
                <span className={timeLeft[asset.id] <= 10 ? 'text-red-500' : ''}>
                  {formatTimeLeft(timeLeft[asset.id])}
                </span>
              </td>
              <td className="py-2 px-4 border-b text-center">
                <button
                  onClick={() => onApprove(asset.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded mr-2 text-xs hover:bg-green-600 transition duration-300"
                >
                  Approve
                </button>
                <button
                  onClick={() => onDecline(asset.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition duration-300"
                >
                  Decline
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetRequestTable;