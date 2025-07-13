import React from "react";
import { Link } from "react-router-dom";

const StoresListPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <Link to="/stores/create" className="btn btn-primary">
          Add Store
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select className="mt-1 input">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Region
              </label>
              <select className="mt-1 input">
                <option value="">All Regions</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                className="mt-1 input"
                placeholder="Search by name or ID..."
              />
            </div>
            <div className="flex items-end">
              <button className="btn btn-outline w-full">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Total Stores</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
            <p className="mt-1 text-sm text-gray-500">All registered stores</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Active Stores</h3>
            <p className="mt-2 text-3xl font-bold text-success-600">0</p>
            <p className="mt-1 text-sm text-gray-500">Currently active</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">
              Inactive Stores
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-500">0</p>
            <p className="mt-1 text-sm text-gray-500">Currently inactive</p>
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="card">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-center" colSpan="6">
                    <div className="text-gray-600">No stores found</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">0</span> to{" "}
          <span className="font-medium">0</span> of{" "}
          <span className="font-medium">0</span> stores
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-outline" disabled>
            Previous
          </button>
          <button className="btn btn-outline" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoresListPage;
