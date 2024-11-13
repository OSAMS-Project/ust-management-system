// StockPriceChart.js
import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockPriceChart = ({ stockData }) => {
  const data = {
    labels: stockData.map(dataPoint => dataPoint.date),
    datasets: [
      {
        label: "Stock Price",
        data: stockData.map(dataPoint => dataPoint.price),
        fill: false,
        borderColor: "#FEC00F",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // allows custom height and width
    plugins: {
      legend: { position: "top", labels: { font: { size: 10 } } }, // Smaller font for legend
      title: { display: true, text: "Stock Price Over Time", font: { size: 14 } }, // Smaller title font
      tooltip: { bodyFont: { size: 10 }, titleFont: { size: 12 } }, // Smaller tooltip font
    },
    scales: {
      x: {
        title: { display: true, text: "Date", font: { size: 12 } },
        ticks: { font: { size: 10 } }, // Smaller x-axis labels
      },
      y: {
        title: { display: true, text: "Stock Price (₱)", font: { size: 12 } },
        ticks: { font: { size: 10 } }, // Smaller y-axis labels
      },
    },
    layout: { padding: { left: 10, right: 10, top: 10, bottom: 10 } }, // Adjust padding for a tighter fit
  };

  // Set custom width and height for a smaller chart
  return <Line data={data} options={options} width={300} height={200} />;
};

export default StockPriceChart;
