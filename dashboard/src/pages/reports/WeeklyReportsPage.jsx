import React, { useState } from "react";
import { Link } from "react-router-dom";

const WeeklyReportsPage = () => {
  const [selectedWeek, setSelectedWeek] = useState(
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
          <h1 className="text-2xl font-bold text-gray-900">Weekly Reports</h1>
        </div>
        <div className="flex space-x-2">
          <input
            type="week"
            className="input"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          />
          <button className="btn btn-outline">Filter</button>
          <button className="btn btn-primary">Export</button>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-success-600">$0.00</p>
            <p className="mt-1 text-sm text-gray-500">This week</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">0</p>
            <p className="mt-1 text-sm text-gray-500">This week</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">
              Average Daily Sales
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">$0.00</p>
            <p className="mt-1 text-sm text-gray-500">Per day</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Growth Rate</h3>
            <p className="mt-2 text-3xl font-bold text-info-600">0%</p>
            <p className="mt-1 text-sm text-gray-500">vs last week</p>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Daily Breakdown</h2>
        </div>
        <div className="card-body">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            Chart will be integrated here
          </div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Category Performance
            </h2>
          </div>
          <div className="card-body">
            <div className="text-center text-gray-600 py-8">
              No data available
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Store Performance
            </h2>
          </div>
          <div className="card-body">
            <div className="text-center text-gray-600 py-8">
              No data available
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Weekly Trends</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                Best Performing Day
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">N/A</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Peak Hours</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">N/A</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                Most Popular Product
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">N/A</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReportsPage;
