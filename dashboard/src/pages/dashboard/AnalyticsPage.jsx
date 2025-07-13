import React from "react";

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Overview */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Sales Overview
            </h2>
          </div>
          <div className="card-body">
            <div className="chart-container">
              {/* TODO: Add chart component */}
              <div className="flex items-center justify-center h-full text-gray-600">
                Chart coming soon
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trends */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Revenue Trends
            </h2>
          </div>
          <div className="card-body">
            <div className="chart-container">
              {/* TODO: Add chart component */}
              <div className="flex items-center justify-center h-full text-gray-600">
                Chart coming soon
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
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

        {/* Store Performance */}
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

      {/* Detailed Stats */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">
            Detailed Statistics
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                Average Order Value
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">$0.00</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                Order Success Rate
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">0%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">
                Customer Retention
              </h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">0%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Growth Rate</h3>
              <p className="mt-2 text-2xl font-bold text-gray-900">0%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
