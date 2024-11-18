import React, { useState } from "react";
import moment from "moment";

const StockPriceOverview = ({ stockData }) => {
  const [selectedRange, setSelectedRange] = useState("7 Days");

  // Filter and group stock data based on selected range
  const filterData = () => {
    const now = moment();
    const ranges = {
      "7 Days": 7,
      "1 Month": 30,
      "3 Months": 90,
      "1 Year": 365,
      Overall: "Overall", // Special case for overall data
    };

    if (selectedRange === "Overall") {
      // Overall: Aggregate all data grouped by year
      const groupedByYear = stockData.reduce((acc, dataPoint) => {
        const dataDate = moment(dataPoint.date);
        const yearKey = dataDate.format("YYYY");
        if (!acc[yearKey]) acc[yearKey] = 0;
        acc[yearKey] += dataPoint.price;
        return acc;
      }, {});

      return Object.entries(groupedByYear).map(([year, total]) => ({
        period: year,
        price: total,
      }));
    }

    if (selectedRange === "1 Year") {
      // 1 Year: Group data by month for the past 1 year and exclude zero-value months
      const oneYearAgo = now.clone().subtract(1, "years").startOf("month");
      const groupedByMonth = stockData.reduce((acc, dataPoint) => {
        const dataDate = moment(dataPoint.date);

        // Only include data within the past 1 year
        if (dataDate.isBefore(oneYearAgo)) return acc;

        const monthKey = dataDate.format("MMMM YYYY");
        if (!acc[monthKey]) acc[monthKey] = 0;
        acc[monthKey] += dataPoint.price;
        return acc;
      }, {});

      return Object.entries(groupedByMonth)
        .filter(([, total]) => total > 0) // Exclude months with 0 total
        .map(([month, total]) => ({
          period: month,
          price: total,
        }));
    }

    if (selectedRange === "3 Months") {
      // Group by month and include months with zero totals
      const lastThreeMonths = Array.from({ length: 3 }, (_, i) =>
        now.clone().subtract(i, "months").format("MMMM YYYY")
      ).reverse();

      const groupedByMonth = stockData.reduce((acc, dataPoint) => {
        const monthKey = moment(dataPoint.date).format("MMMM YYYY");
        if (!acc[monthKey]) acc[monthKey] = 0;
        acc[monthKey] += dataPoint.price;
        return acc;
      }, {});

      return lastThreeMonths.map((month) => ({
        period: month,
        price: groupedByMonth[month] || 0,
      }));
    }

    // Filters for "7 Days" and "1 Month" exclude zero-value dates
    const filteredData = stockData.filter((dataPoint) => {
      const dataDate = moment(dataPoint.date);
      const daysDifference = now.diff(dataDate, "days");

      return (
        daysDifference <= ranges[selectedRange] && dataPoint.price > 0
      );
    });

    return filteredData.map((dataPoint) => ({
      period: moment(dataPoint.date).format("MMMM D, YYYY"),
      price: dataPoint.price,
    }));
  };

  const filteredStockData = filterData();

  // Calculate Total Stock Price
  const totalStockPrice = filteredStockData.reduce(
    (sum, dataPoint) => sum + dataPoint.price,
    0
  );

  return (
    <div className="border border-gray-300 rounded-lg h-[240px] flex flex-col">
      <div className="bg-black text-[#FEC00F] text-sm py-2 px-4 rounded-t-lg font-bold">
        Stock Price Overview
      </div>

      <div className="flex justify-between items-center px-4 py-2 bg-gray-100">
        <span className="text-gray-700 text-sm">Filter by:</span>
        <select
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value)}
          className="text-sm border rounded px-2 py-1 focus:outline-none"
        >
          <option value="7 Days">Last 7 Days</option>
          <option value="1 Month">Last 1 Month</option>
          <option value="3 Months">Last 3 Months</option>
          <option value="1 Year">Last 1 Year</option>
          <option value="Overall">Overall (All Years)</option>
        </select>
      </div>

      <div className="flex-grow bg-white p-2 rounded-b-lg overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-1 text-gray-600">
                {selectedRange === "3 Months" || selectedRange === "1 Year" || selectedRange === "Overall"
                  ? "Period"
                  : "Date"}
              </th>
              <th className="py-1 text-gray-600">Stock Price (₱)</th>
            </tr>
          </thead>
          <tbody>
            {filteredStockData.length > 0 ? (
              filteredStockData.map((dataPoint, index) => (
                <tr key={index} className={`border-b ${index === filteredStockData.length - 1 ? "bg-yellow-100 font-bold" : ""}`}>
                  <td className="py-1">{dataPoint.period}</td>
                  <td className="py-1">{dataPoint.price.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="py-1 text-center text-gray-500">
                  No data available for the selected range.
                </td>
              </tr>
            )}
          </tbody>
          {filteredStockData.length > 0 && (
            <tfoot>
              <tr className="border-t">
                <td className="py-1 font-bold text-gray-800">Total</td>
                <td className="py-1 font-bold text-gray-800">
                  ₱{totalStockPrice.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default StockPriceOverview;
