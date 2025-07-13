import React from "react";

const DistributionSchedulePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Distribution Schedule
        </h1>
        <button className="btn btn-primary">Create Schedule</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">
            Today's Schedule
          </h2>
        </div>
        <div className="card-body">
          <div className="text-center text-gray-600 py-8">
            No scheduled deliveries for today
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deliveries */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Upcoming Deliveries
            </h2>
          </div>
          <div className="card-body">
            <div className="text-center text-gray-600 py-8">
              No upcoming deliveries
            </div>
          </div>
        </div>

        {/* Available Distributors */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">
              Available Distributors
            </h2>
          </div>
          <div className="card-body">
            <div className="text-center text-gray-600 py-8">
              No distributors available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionSchedulePage;
