import React from "react";
import { useParams } from "react-router-dom";

const PaymentDetailsPage = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Payment Details</h1>

      {/* Payment Information Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">Payment Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Payment ID</p>
            <p className="font-medium">{id}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Completed
            </span>
          </div>
          <div>
            <p className="text-gray-600">Amount</p>
            <p className="font-medium">€500.00</p>
          </div>
          <div>
            <p className="text-gray-600">Date</p>
            <p className="font-medium">March 25, 2024</p>
          </div>
        </div>
      </div>

      {/* Payment Method Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-medium mb-4">Payment Method</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Method</p>
            <p className="font-medium">Cash</p>
          </div>
          <div>
            <p className="text-gray-600">Reference</p>
            <p className="font-medium">REF123456</p>
          </div>
        </div>
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-medium mb-4">Store Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Store Name</p>
            <p className="font-medium">Downtown Bakery</p>
          </div>
          <div>
            <p className="text-gray-600">Store ID</p>
            <p className="font-medium">ST123</p>
          </div>
          <div>
            <p className="text-gray-600">Address</p>
            <p className="font-medium">123 Baker Street</p>
          </div>
          <div>
            <p className="text-gray-600">Contact</p>
            <p className="font-medium">+1 234 567 8900</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;
