import React from "react";
import { useAuthStore } from "../../stores/authStore";

const DashboardHomePage = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-600">Welcome back, {user?.name}</div>
      </div>

      <div className="dashboard-grid">
        {/* Quick Stats */}
        <div className="dashboard-stat">
          <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">0</p>
          <p className="mt-1 text-sm text-gray-600">Last 30 days</p>
        </div>

        <div className="dashboard-stat">
          <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-success-600">$0.00</p>
          <p className="mt-1 text-sm text-gray-600">Last 30 days</p>
        </div>

        <div className="dashboard-stat">
          <h3 className="text-lg font-medium text-gray-900">Active Stores</h3>
          <p className="mt-2 text-3xl font-bold text-info-600">0</p>
          <p className="mt-1 text-sm text-gray-600">Currently active</p>
        </div>

        <div className="dashboard-stat">
          <h3 className="text-lg font-medium text-gray-900">
            Pending Deliveries
          </h3>
          <p className="mt-2 text-3xl font-bold text-warning-600">0</p>
          <p className="mt-1 text-sm text-gray-600">Needs attention</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="card-body">
          <div className="text-center text-gray-600 py-8">
            No recent activity to display
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              <button className="w-full btn btn-outline">
                Create New Order
              </button>
              <button className="w-full btn btn-outline">Add New Store</button>
              <button className="w-full btn btn-outline">View Reports</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">System Status</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="badge badge-success">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync</span>
                <span className="text-sm text-gray-900">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
