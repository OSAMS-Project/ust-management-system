// BorrowerFrequencyChart.js
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BorrowerFrequencyChart = ({ borrowerData }) => {
  const data = {
    labels: Object.keys(borrowerData),
    datasets: [
      {
        label: "Borrower Frequency",
        data: Object.values(borrowerData),
        backgroundColor: "#FEC00F",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { font: { size: 12 } } },
      title: { display: true, text: "Borrower Frequency", font: { size: 16 } },
    },
    scales: {
      x: { title: { display: true, text: "Borrowers", font: { size: 12 } } },
      y: { title: { display: true, text: "Frequency", font: { size: 12 } }, beginAtZero: true },
    },
  };

  return (
    <div className="w-full h-64">
      <Bar data={data} options={options} />
    </div>
  );
};

export default BorrowerFrequencyChart;
