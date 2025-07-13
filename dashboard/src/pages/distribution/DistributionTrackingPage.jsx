import React from "react";

const DistributionTrackingPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Distribution Tracking
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Map */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Live Tracking Map
            </h2>
          </div>
          <div className="card-body">
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              Live tracking map will be integrated here
            </div>
          </div>
        </div>

        {/* Active Distributors */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Active Distributors
            </h2>
          </div>
          <div className="card-body">
            <div className="text-center text-gray-600 py-8">
              No active distributors
            </div>
          </div>
        </div>

        {/* Delivery Status */}
        <div className="card lg:col-span-3">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Delivery Status
            </h2>
          </div>
          <div className="card-body">
            <div className="text-center text-gray-600 py-8">
              No active deliveries to track
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Updates */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">
            Real-time Updates
          </h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="text-center text-gray-600 py-8">
              No recent updates
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionTrackingPage;
