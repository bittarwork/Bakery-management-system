import React from "react";

const DistributionReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Distribution Reports
        </h1>
        <div className="flex space-x-2">
          <button className="btn btn-outline">Filter</button>
          <button className="btn btn-primary">Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Performance */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Delivery Performance
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

        {/* Distribution Efficiency */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Distribution Efficiency
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
      </div>

      {/* Detailed Reports */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">
            Detailed Reports
          </h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Total Deliveries
                </h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  On-Time Rate
                </h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">0%</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">
                  Average Time
                </h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">N/A</p>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-center text-gray-600 py-8">
                No report data available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionReportsPage;
