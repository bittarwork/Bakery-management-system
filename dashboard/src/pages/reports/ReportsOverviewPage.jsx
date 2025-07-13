import React from "react";
import { Link } from "react-router-dom";

const ReportsOverviewPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Reports Overview</h1>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Total Sales</h3>
          <p className="text-2xl font-bold text-gray-900">€15,250.00</p>
          <p className="text-green-600 text-sm">+8.5% from last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Orders</h3>
          <p className="text-2xl font-bold text-blue-600">1,247</p>
          <p className="text-green-600 text-sm">+12% from last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Active Stores</h3>
          <p className="text-2xl font-bold text-purple-600">24</p>
          <p className="text-gray-600 text-sm">2 new this month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Avg Order Value</h3>
          <p className="text-2xl font-bold text-orange-600">€12.24</p>
          <p className="text-red-600 text-sm">-2.1% from last month</p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          to="/reports/daily"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Daily Reports</h3>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            View detailed daily sales reports with hourly breakdowns and
            performance metrics.
          </p>
          <div className="flex items-center text-blue-600 text-sm font-medium">
            View Reports
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        <Link
          to="/reports/weekly"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Weekly Reports
            </h3>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Analyze weekly trends, compare performance, and identify growth
            patterns.
          </p>
          <div className="flex items-center text-green-600 text-sm font-medium">
            View Reports
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        <Link
          to="/reports/monthly"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Monthly Reports
            </h3>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Comprehensive monthly analysis with revenue trends and business
            insights.
          </p>
          <div className="flex items-center text-purple-600 text-sm font-medium">
            View Reports
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Recent Report Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Daily Report Generated
                  </p>
                  <p className="text-xs text-gray-500">
                    March 25, 2024 - 09:00 AM
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">€2,450.00</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Weekly Report Completed
                  </p>
                  <p className="text-xs text-gray-500">
                    March 24, 2024 - 11:30 PM
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">€15,200.00</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Monthly Report Generated
                  </p>
                  <p className="text-xs text-gray-500">
                    March 1, 2024 - 12:00 AM
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500">€58,750.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsOverviewPage;
