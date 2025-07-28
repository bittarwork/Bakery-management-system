import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  TrashIcon,
  ShoppingCartIcon,
  CurrencyEuroIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import orderService from "../../services/orderService.js";
import storeService from "../../services/storeService";
import productService from "../../services/productService";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import BackButton from "../../components/ui/BackButton";

const CreateOrderPage = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    store_id: "",
    currency: "EUR",
    delivery_date: "",
    notes: "",
    items: [],
  });

  // Loading and data states
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch stores and products on component mount
  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const response = await storeService.getStores({ status: "active" });
      // Handle both old and new response formats
      const storesData = response.data || response;
      setStores(storesData.stores || storesData || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Error loading stores");
    } finally {
      setLoadingStores(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productService.getProducts({ status: "active" });
      // Handle both old and new response formats
      const productsData = response.data || response;
      setProducts(productsData.products || productsData || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error loading products");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Add new item to order
  const addItem = () => {
    const newItem = {
      id: Date.now(), // Temporary ID for frontend
      product_id: "",
      quantity: 1,
      notes: "",
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Remove item from order
  const removeItem = (itemId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  // Update item data
  const updateItem = (itemId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Get product details
  const getProduct = (productId) => {
    return products.find((product) => product.id === parseInt(productId));
  };

  // Calculate item total
  const calculateItemTotal = (item) => {
    const product = getProduct(item.product_id);
    if (!product) return { eur: 0, syp: 0 };

    const quantity = parseInt(item.quantity) || 0;
    return {
      eur: (product.price_eur || 0) * quantity,
      syp: (product.price_syp || 0) * quantity,
    };
  };

  // Calculate order total
  const calculateOrderTotal = () => {
    let totalEur = 0;
    let totalSyp = 0;

    formData.items.forEach((item) => {
      const itemTotal = calculateItemTotal(item);
      totalEur += itemTotal.eur;
      totalSyp += itemTotal.syp;
    });

    return { eur: totalEur, syp: totalSyp };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.store_id) {
      toast.error("Please select a store");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    // Validate all items have products and quantities
    const invalidItems = formData.items.filter(
      (item) =>
        !item.product_id || !item.quantity || parseInt(item.quantity) <= 0
    );

    if (invalidItems.length > 0) {
      toast.error("Please fill in all item details with valid quantities");
      return;
    }

    try {
      setLoading(true);

      // Prepare order data for API
      const orderData = {
        store_id: parseInt(formData.store_id),
        currency: formData.currency,
        delivery_date: formData.delivery_date || null,
        notes: formData.notes,
        items: formData.items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          notes: item.notes || null,
        })),
      };

      const response = await orderService.createOrder(orderData);

      toast.success("Order created successfully");
      navigate(`/orders/${response.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error creating order";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const orderTotal = calculateOrderTotal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShoppingCartIcon className="h-8 w-8 mr-3 text-blue-600" />
              Create New Order
            </h1>
            <p className="text-gray-600 mt-1">Add a new order to the system</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Details */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Store Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store *
                </label>
                {loadingStores ? (
                  <div className="flex items-center justify-center h-10 border rounded-lg">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : (
                  <select
                    value={formData.store_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        store_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a store</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name} - {store.location}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {orderService.getCurrencyOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        delivery_date: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special instructions or notes for this order..."
              />
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="p-6">
            {formData.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No items yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding an item to the order.
                </p>
                <button
                  type="button"
                  onClick={addItem}
                  className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add First Item
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => {
                  const product = getProduct(item.product_id);
                  const itemTotal = calculateItemTotal(item);

                  return (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          Item #{index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Product Selection */}
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product *
                          </label>
                          {loadingProducts ? (
                            <div className="flex items-center justify-center h-10 border rounded-lg">
                              <LoadingSpinner size="sm" />
                            </div>
                          ) : (
                            <select
                              value={item.product_id}
                              onChange={(e) =>
                                updateItem(
                                  item.id,
                                  "product_id",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            >
                              <option value="">Select a product</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} -{" "}
                                  {orderService.formatAmount(
                                    product.price_eur,
                                    "EUR"
                                  )}{" "}
                                  /{" "}
                                  {orderService.formatAmount(
                                    product.price_syp,
                                    "SYP"
                                  )}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(item.id, "quantity", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        {/* Item Total */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="text-sm text-gray-900">
                              {formData.currency === "EUR"
                                ? orderService.formatAmount(
                                    itemTotal.eur,
                                    "EUR"
                                  )
                                : orderService.formatAmount(
                                    itemTotal.syp,
                                    "SYP"
                                  )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product Info */}
                      {product && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-700">
                              <strong>{product.name}</strong> (
                              {product.unit || "piece"})
                            </span>
                            <span className="text-blue-600">
                              Stock:{" "}
                              {product.stock_quantity !== null
                                ? product.stock_quantity
                                : "Unlimited"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Item Notes */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Notes
                        </label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) =>
                            updateItem(item.id, "notes", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Special instructions for this item..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Order Summary */}
        {formData.items.length > 0 && (
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Order Summary
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-blue-600">
                  {formData.currency === "EUR"
                    ? orderService.formatAmount(orderTotal.eur, "EUR")
                    : orderService.formatAmount(orderTotal.syp, "SYP")}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {formData.items.length} item
                {formData.items.length !== 1 ? "s" : ""} in this order
              </div>
            </div>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || formData.items.length === 0}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating Order...
              </>
            ) : (
              <>
                <ShoppingCartIcon className="h-4 w-4 mr-2" />
                Create Order
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
