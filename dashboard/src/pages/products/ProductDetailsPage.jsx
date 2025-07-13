import React from "react";
import { Link, useParams } from "react-router-dom";

const ProductDetailsPage = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/products" className="text-gray-500 hover:text-gray-700">
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
          <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-outline">Edit</button>
          <button className="btn btn-primary">Update Stock</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">
                Product Information
              </h2>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Product Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">N/A</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Product Code
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">{id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Category
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">N/A</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">Inactive</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Price</dt>
                  <dd className="mt-1 text-sm text-gray-900">$0.00</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Stock</dt>
                  <dd className="mt-1 text-sm text-gray-900">0</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">N/A</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">
                Stock History
              </h2>
            </div>
            <div className="card-body">
              <div className="text-center text-gray-600 py-8">
                No stock history available
              </div>
            </div>
          </div>
        </div>

        {/* Product Stats */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">
                Product Statistics
              </h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Total Orders
                </h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">0</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Total Revenue
                </h3>
                <p className="mt-1 text-2xl font-bold text-success-600">
                  $0.00
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Average Daily Sales
                </h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Sales Trend</h2>
            </div>
            <div className="card-body">
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                Chart will be integrated here
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
