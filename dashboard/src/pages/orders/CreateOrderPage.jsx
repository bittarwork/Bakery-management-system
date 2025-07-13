import React, { useState } from "react";
import { Link } from "react-router-dom";

const CreateOrderPage = () => {
  const [formData, setFormData] = useState({
    store: "",
    items: [{ product: "", quantity: 1, price: 0 }],
    notes: "",
  });

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product: "", quantity: 1, price: 0 }],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value };
        }
        return item;
      }),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement order creation
    console.log("Form data:", formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/orders" className="text-gray-500 hover:text-gray-700">
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
          <h1 className="text-2xl font-bold text-gray-900">Create Order</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Store
              </label>
              <select
                className="mt-1 input"
                value={formData.store}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, store: e.target.value }))
                }
                required
              >
                <option value="">Select a store</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                className="mt-1 input"
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
          </div>
          <div className="card-body space-y-4">
            {formData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
              >
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Product
                  </label>
                  <select
                    className="mt-1 input"
                    value={item.product}
                    onChange={(e) =>
                      handleItemChange(index, "product", e.target.value)
                    }
                    required
                  >
                    <option value="">Select a product</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="mt-1 input"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseInt(e.target.value)
                      )
                    }
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="btn btn-outline text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-outline w-full"
            >
              Add Item
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Link to="/orders" className="btn btn-outline">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary">
            Create Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
