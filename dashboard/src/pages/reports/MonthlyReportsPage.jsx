import React, { useState } from "react";
import { Link } from "react-router-dom";

const MonthlyReportsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
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
          <h1 className="text-2xl font-bold text-gray-900">Monthly Reports</h1>
        </div>
        <div className="flex space-x-2">
          <input
            type="month"
            className="input"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <button className="btn btn-outline">Filter</button>
          <button className="btn btn-primary">Export</button>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-success-600">$0.00</p>
            <p className="mt-1 text-sm text-gray-500">This month</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
            <p className="mt-2 text-3xl font-bold text-primary-600">0</p>
            <p className="mt-1 text-sm text-gray-500">This month</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">
              Average Daily Revenue
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">$0.00</p>
            <p className="mt-1 text-sm text-gray-500">Per day</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Growth Rate</h3>
            <p className="mt-2 text-3xl font-bold text-info-600">0%</p>
            <p className="mt-1 text-sm text-gray-500">vs last month</p>
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Revenue Trend</h2>
        </div>
        <div className="card-body">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            Chart will be integrated here
          </div>
        </div>
      </div>

      {/* Category & Store Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Category Analysis
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
              Store Analysis
            </h2>
          </div>
          <div className="card-body">
            <div className="text-center text-gray-600 py-8">
              No data available
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Insights */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">
            Monthly Insights
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                Best Performing Week
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">N/A</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                Best Performing Store
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">N/A</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                Most Popular Category
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">N/A</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">
            Detailed Analysis
          </h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Order Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-center" colSpan="5">
                    <div className="text-gray-600">No data available</div>
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

export default MonthlyReportsPage;
