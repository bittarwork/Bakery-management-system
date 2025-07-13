import React, { useState } from "react";
import { Link } from "react-router-dom";

const DailyReportsPage = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/reports" className="text-gray-500 hover:text-gray-700">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
        </div>
        <div className="flex space-x-2">
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="btn btn-outline">Filter</button>
          <button className="btn btn-primary">Export</button>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Total Sales</h3>
            <p className="mt-2 text-3xl font-bold text-success-600">$0.00</p>
            <p className="mt-1 text-sm text-gray-500">0 orders</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">
              Average Order Value
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">$0.00</p>
            <p className="mt-1 text-sm text-gray-500">Per order</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">
              Total Products Sold
            </h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">0</p>
            <p className="mt-1 text-sm text-gray-500">All categories</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Active Stores</h3>
            <p className="mt-2 text-3xl font-bold text-info-600">0</p>
            <p className="mt-1 text-sm text-gray-500">Made orders today</p>
          </div>
        </div>
      </div>

      {/* Sales by Hour */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Sales by Hour</h2>
        </div>
        <div className="card-body">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            Chart will be integrated here
          </div>
        </div>
      </div>

      {/* Top Products & Stores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Top Products</h2>
          </div>
          <div className="card-body">
            <div className="text-center text-gray-600 py-8">
              No data available
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Top Stores</h2>
          </div>
          <div className="card-body">
            <div className="text-center text-gray-600 py-8">
              No data available
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Transactions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">
            Detailed Transactions
          </h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-center" colSpan="6">
                    <div className="text-gray-600">No transactions found</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReportsPage;
