import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Store,
  Package,
  Euro,
  Calendar,
  FileText,
  CheckCircle,
  Minus,
  Eye,
  Search,
  ShoppingCart,
  Clock,
  CreditCard,
  User,
  X,
  AlertTriangle,
  Truck,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import orderService from "../../services/orderService";
import storeService from "../../services/storeService";
import productService from "../../services/productService";
import userService from "../../services/userService";
import { toast } from "react-hot-toast";

const CreateOrderPage = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    store_id: "",
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    priority: "medium",
    distributor_id: "",
    discount_amount: 0,
    discount_type: "amount", // "amount" or "percentage"
    notes: "",
    special_instructions: "",
    items: [],
  });

  // Supporting data
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Product selection modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);

  // Order summary
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    total: 0,
    itemCount: 0,
  });

  // Priority options
  const priorityOptions = [
    {
      value: "low",
      label: "Low Priority",
      color: "bg-gray-100 text-gray-800",
      icon: Clock,
    },
    {
      value: "medium",
      label: "Medium Priority",
      color: "bg-blue-100 text-blue-800",
      icon: Clock,
    },
    {
      value: "high",
      label: "High Priority",
      color: "bg-orange-100 text-orange-800",
      icon: Truck,
    },
    {
      value: "urgent",
      label: "Urgent",
      color: "bg-red-100 text-red-800",
      icon: AlertTriangle,
    },
  ];

  // Initialize data
  useEffect(() => {
    fetchStores();
    fetchProducts();
    fetchDistributors();
  }, []);

  // Calculate order summary whenever items or discount changes
  useEffect(() => {
    calculateOrderSummary();
  }, [formData.items, formData.discount_amount, formData.discount_type]);

  // Fetch stores
  const fetchStores = async () => {
    try {
      const response = await storeService.getStores({ limit: 1000 });
      if (response.success) {
        setStores(response.data.stores || []);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to fetch stores");
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 1000 });
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  // Fetch distributors
  const fetchDistributors = async () => {
    try {
      const response = await userService.getUsers({
        role: "distributor",
        limit: 1000,
      });
      if (response.success) {
        setDistributors(response.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching distributors:", error);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Add product to order
  const addProductToOrder = () => {
    if (!selectedProduct || productQuantity <= 0) {
      toast.error("Please select a product and enter a valid quantity");
      return;
    }

    const existingItemIndex = formData.items.findIndex(
      (item) => item.product_id === selectedProduct.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += productQuantity;
      updatedItems[existingItemIndex].total_price =
        updatedItems[existingItemIndex].quantity * selectedProduct.price_eur;

      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    } else {
      // Add new item
      const newItem = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        unit_price: selectedProduct.price_eur,
        quantity: productQuantity,
        total_price: selectedProduct.price_eur * productQuantity,
        product_unit: selectedProduct.unit,
      };

      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }

    // Reset selection
    setSelectedProduct(null);
    setProductQuantity(1);
    setShowProductModal(false);
    toast.success("Product added to order");
  };

  // Remove product from order
  const removeProductFromOrder = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
    toast.success("Product removed from order");
  };

  // Update item quantity
  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeProductFromOrder(index);
      return;
    }

    const updatedItems = [...formData.items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total_price =
      updatedItems[index].unit_price * newQuantity;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Calculate order summary
  const calculateOrderSummary = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.total_price,
      0
    );
    let discount = 0;

    if (formData.discount_type === "percentage") {
      discount = (subtotal * formData.discount_amount) / 100;
    } else {
      discount = formData.discount_amount;
    }

    const total = subtotal - discount;
    const itemCount = formData.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    setOrderSummary({
      subtotal,
      discount,
      total: Math.max(0, total),
      itemCount,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.store_id) {
      newErrors.store_id = "Store is required";
    }

    if (!formData.order_date) {
      newErrors.order_date = "Order date is required";
    }

    if (formData.items.length === 0) {
      newErrors.items = "At least one product is required";
    }

    if (
      formData.delivery_date &&
      new Date(formData.delivery_date) < new Date(formData.order_date)
    ) {
      newErrors.delivery_date = "Delivery date cannot be before order date";
    }

    if (formData.discount_amount < 0) {
      newErrors.discount_amount = "Discount cannot be negative";
    }

    if (
      formData.discount_type === "percentage" &&
      formData.discount_amount > 100
    ) {
      newErrors.discount_amount = "Percentage discount cannot exceed 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        store_id: parseInt(formData.store_id),
        order_date: formData.order_date,
        delivery_date: formData.delivery_date || null,
        priority: formData.priority,
        distributor_id: formData.distributor_id
          ? parseInt(formData.distributor_id)
          : null,
        discount_amount: formData.discount_amount,
        discount_type: formData.discount_type,
        notes: formData.notes,
        special_instructions: formData.special_instructions,
        items: formData.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        toast.success("Order created successfully");
        navigate(`/orders/${response.data.id}`);
      } else {
        toast.error(response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  // Save as draft
  const handleSaveAsDraft = async () => {
    if (formData.items.length === 0) {
      toast.error("Add at least one product to save as draft");
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        ...formData,
        status: "draft",
        store_id: parseInt(formData.store_id),
        distributor_id: formData.distributor_id
          ? parseInt(formData.distributor_id)
          : null,
        items: formData.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        toast.success("Order saved as draft");
        navigate(`/orders/${response.data.id}`);
      } else {
        toast.error(response.message || "Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const config =
      priorityOptions.find((p) => p.value === priority) || priorityOptions[1];
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Order
            </h1>
            <p className="text-gray-600">
              Add products and configure order details
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={isLoading}
          >
            <FileText className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || formData.items.length === 0}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Order
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Store Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store *
                  </label>
                  <select
                    value={formData.store_id}
                    onChange={(e) =>
                      handleFieldChange("store_id", e.target.value)
                    }
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.store_id ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a store</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name} - {store.address}
                      </option>
                    ))}
                  </select>
                  {errors.store_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.store_id}
                    </p>
                  )}
                </div>

                {/* Order Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) =>
                      handleFieldChange("order_date", e.target.value)
                    }
                    className={errors.order_date ? "border-red-500" : ""}
                  />
                  {errors.order_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.order_date}
                    </p>
                  )}
                </div>

                {/* Delivery Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date
                  </label>
                  <Input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) =>
                      handleFieldChange("delivery_date", e.target.value)
                    }
                    min={formData.order_date}
                    className={errors.delivery_date ? "border-red-500" : ""}
                  />
                  {errors.delivery_date && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.delivery_date}
                    </p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      handleFieldChange("priority", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Distributor */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Distributor
                  </label>
                  <select
                    value={formData.distributor_id}
                    onChange={(e) =>
                      handleFieldChange("distributor_id", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a distributor (optional)</option>
                    {distributors.map((distributor) => (
                      <option key={distributor.id} value={distributor.id}>
                        {distributor.full_name || distributor.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Products</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowProductModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {errors.items && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.items}</p>
                </div>
              )}

              {formData.items.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products added yet</p>
                  <p className="text-sm text-gray-400">
                    Click "Add Product" to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(item.unit_price)} per{" "}
                          {item.product_unit}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateItemQuantity(index, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              updateItemQuantity(index, item.quantity + 1)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="font-medium text-green-600">
                          {formatCurrency(item.total_price)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProductFromOrder(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Discount */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Discount</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      handleFieldChange("discount_type", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="amount">Fixed Amount (€)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value
                  </label>
                  <Input
                    type="number"
                    value={formData.discount_amount}
                    onChange={(e) =>
                      handleFieldChange(
                        "discount_amount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    min="0"
                    max={
                      formData.discount_type === "percentage"
                        ? "100"
                        : undefined
                    }
                    step="0.01"
                    placeholder="0.00"
                    className={errors.discount_amount ? "border-red-500" : ""}
                  />
                  {errors.discount_amount && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.discount_amount}
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Notes & Instructions</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any general notes about this order..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Instructions
                  </label>
                  <textarea
                    value={formData.special_instructions}
                    onChange={(e) =>
                      handleFieldChange("special_instructions", e.target.value)
                    }
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add special delivery or handling instructions..."
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Order Summary</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Items ({orderSummary.itemCount})</span>
                  <span>{formatCurrency(orderSummary.subtotal)}</span>
                </div>
                {orderSummary.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>
                      Discount (
                      {formData.discount_type === "percentage"
                        ? `${formData.discount_amount}%`
                        : "Fixed"}
                      )
                    </span>
                    <span>-{formatCurrency(orderSummary.discount)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">
                    {formatCurrency(orderSummary.total)}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Order Details</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {formData.store_id && (
                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {stores.find((s) => s.id === parseInt(formData.store_id))
                        ?.name || "Store"}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    Order: {new Date(formData.order_date).toLocaleDateString()}
                  </span>
                </div>
                {formData.delivery_date && (
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      Delivery:{" "}
                      {new Date(formData.delivery_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Priority: </span>
                  {getPriorityBadge(formData.priority)}
                </div>
                {formData.distributor_id && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      Distributor:{" "}
                      {distributors.find(
                        (d) => d.id === parseInt(formData.distributor_id)
                      )?.full_name || "Assigned"}
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowProductModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      delivery_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0],
                    }));
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Set Tomorrow Delivery
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleFieldChange("priority", "urgent")}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Mark as Urgent
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Product</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProductModal(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <Input
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Product List */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.category} • {product.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {formatCurrency(product.price_eur)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Stock: {product.stock_quantity || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity Selection */}
            {selectedProduct && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium">{selectedProduct.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(selectedProduct.price_eur)} per{" "}
                      {selectedProduct.unit}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setProductQuantity(Math.max(1, productQuantity - 1))
                      }
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={productQuantity}
                      onChange={(e) =>
                        setProductQuantity(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      min="1"
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProductQuantity(productQuantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">
                    Total:{" "}
                    {formatCurrency(
                      selectedProduct.price_eur * productQuantity
                    )}
                  </div>
                  <Button onClick={addProductToOrder}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrderPage;
