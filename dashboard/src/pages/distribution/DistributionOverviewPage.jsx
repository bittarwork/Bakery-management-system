import React from "react";

const DistributionOverviewPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Distribution Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Map */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Distribution Map
            </h2>
          </div>
          <div className="card-body">
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              Map will be integrated here
            </div>
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Active Deliveries
            </h2>
          </div>
          <div className="card-body">
            <div className="text-center text-gray-600 py-8">
              No active deliveries
            </div>
          </div>
        </div>

        {/* Distribution Stats */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Distribution Statistics
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Deliveries Today</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">On-Time Delivery Rate</span>
                <span className="font-medium">0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Delivery Time</span>
                <span className="font-medium">N/A</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionOverviewPage;
