import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BorrowerFrequencyChart = ({ borrowerData }) => {
  const data = {
    labels: Object.keys(borrowerData || {}),
    datasets: [
      {
        label: "Frequency",
        data: Object.values(borrowerData || {}),
        backgroundColor: "#FEC00F",
        borderRadius: 5,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "#000",
        bodyColor: "#FFF",
        titleColor: "#fff",
        cornerRadius: 5,
      },
    },
    scales: {
      x: { beginAtZero: true, ticks: { color: "#000", font: { size: 10 } } },
      y: { ticks: { color: "#000", font: { size: 10 } } },
    },
  };

  return (
    <div className="border border-gray-300 rounded-lg h-[240px] flex flex-col">
      <div className="bg-black text-[#FEC00F] text-sm py-2 px-4 rounded-t-lg font-bold">
        Borrower Frequency
      </div>
      <div className="w-full h-full p-2 bg-white flex-grow rounded-b-lg">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default BorrowerFrequencyChart;
