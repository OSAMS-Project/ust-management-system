import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const EventCompletionChart = ({ completedEvents, totalEvents }) => {
  const upcomingEvents = Math.max(totalEvents - completedEvents.length, 0);

  const data = {
    labels: ["Completed Events", "Upcoming Events"],
    datasets: [
      {
        data: [completedEvents.length || 0, upcomingEvents],
        backgroundColor: ["#FEC00F", "#333333"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#000",
        bodyColor: "#FFF",
        titleColor: "#FEC00F",
      },
    },
  };

  return (
    <div className="border border-gray-300 rounded-lg h-[240px] flex flex-col">
      <div className="bg-black text-[#FEC00F] text-sm py-2 px-4 rounded-t-lg font-bold">
        Event Completion Rate
      </div>
      <div className="grid grid-cols-5 bg-white text-black p-4 rounded-b-lg flex-grow gap-2">
        {/* Pie Chart */}
        <div className="col-span-3 flex items-center justify-center">
          <div className="w-42 h-42">
            <Pie data={data} options={options} />
          </div>
        </div>
        {/* Labels */}
        <div className="col-span-2 flex flex-col justify-center space-y-2">
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#FEC00F" }}
            ></div>
            <p className="ml-2 font-medium">
              Completed:{" "}
              <span className="text-gray-600">{completedEvents.length}</span>
            </p>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#333333" }}
            ></div>
            <p className="ml-2 font-medium">
              Upcoming:{" "}
              <span className="text-gray-600">{upcomingEvents}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCompletionChart;
