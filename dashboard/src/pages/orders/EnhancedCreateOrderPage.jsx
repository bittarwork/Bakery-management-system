import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Calculator,
  MessageSquare,
  Settings,
  Zap,
  Star,
  Bell,
  Globe,
  Shield,
  Award,
  Target,
  BarChart3,
  TrendingUp,
  Activity,
  Percent,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import orderService from "../../services/orderService";
import storeService from "../../services/storeService";
import productService from "../../services/productService";
import userService from "../../services/userService";
import { toast } from "react-hot-toast";

// Import our new advanced components
import OrderSchedulingSystem from "../../components/orders/OrderSchedulingSystem";
import SpecialInstructionsManager from "../../components/orders/SpecialInstructionsManager";
import DynamicPricingSystem from "../../components/orders/DynamicPricingSystem";
import AdvancedTaxCalculator from "../../components/orders/AdvancedTaxCalculator";
import DiscountManager from "../../components/orders/DiscountManager";
import GiftManager from "../../components/orders/GiftManager";

const EnhancedCreateOrderPage = () => {
  const navigate = useNavigate();

  // Main order state
  const [orderData, setOrderData] = useState({
    store_id: "",
    customer_id: "",
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    priority: "medium",
    distributor_id: "",
    currency: "EUR",
    exchange_rate: 2500,
    notes: "",
    special_instructions: "",
    items: [],

    // Pricing and tax data
    subtotal: 0,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 0,

    // Advanced features
    scheduling_enabled: true,
    dynamic_pricing_enabled: true,
    tax_calculation_enabled: true,

    // Status
    status: "pending",
    payment_status: "pending",
  });

  // Supporting data
  const [stores, setStores] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [distributors, setDistributors] = useState([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState("basic");
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);

  // Order summary state
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discounts: 0,
    taxes: 0,
    total: 0,
    itemCount: 0,
    currency: "EUR",
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update order summary when items change
  useEffect(() => {
    calculateOrderSummary();
  }, [orderData.items, orderData.discount_amount, orderData.tax_amount]);

  // Load all required data
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [storesRes, customersRes, productsRes, distributorsRes] =
        await Promise.all([
          storeService.getStores(),
          userService.getCustomers(),
          productService.getProducts({ limit: 200 }),
          userService.getDistributors(),
        ]);

      if (storesRes.success) setStores(storesRes.data || []);
      if (customersRes.success) setCustomers(customersRes.data || []);
      if (productsRes.success) setProducts(productsRes.data.products || []);
      if (distributorsRes.success) setDistributors(distributorsRes.data || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load initial data");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate order summary
  const calculateOrderSummary = () => {
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    const itemCount = orderData.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const discounts = orderData.discount_amount || 0;
    const taxes = orderData.tax_amount || 0;
    const total = subtotal - discounts + taxes;

    setOrderSummary({
      subtotal,
      discounts,
      taxes,
      total: Math.max(0, total),
      itemCount,
      currency: orderData.currency,
    });

    // Update order data
    setOrderData((prev) => ({
      ...prev,
      subtotal,
      total_amount: total,
    }));
  };

  // Handle field changes
  const handleFieldChange = (field, value) => {
    setOrderData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear related errors
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Add product to order
  const addProductToOrder = () => {
    if (!selectedProduct || productQuantity <= 0) {
      toast.error("Please select a product and valid quantity");
      return;
    }

    const existingItemIndex = orderData.items.findIndex(
      (item) => item.product_id === selectedProduct.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderData.items];
      updatedItems[existingItemIndex].quantity += productQuantity;
      updatedItems[existingItemIndex].total_price =
        updatedItems[existingItemIndex].unit_price *
        updatedItems[existingItemIndex].quantity;

      setOrderData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    } else {
      // Add new item
      const newItem = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        category: selectedProduct.category,
        quantity: productQuantity,
        unit_price: selectedProduct.price_eur || selectedProduct.price || 0,
        total_price:
          (selectedProduct.price_eur || selectedProduct.price || 0) *
          productQuantity,
        notes: "",
      };

      setOrderData((prev) => ({
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
    const updatedItems = orderData.items.filter((_, i) => i !== index);
    setOrderData((prev) => ({
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

    const updatedItems = [...orderData.items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total_price =
      updatedItems[index].unit_price * newQuantity;

    setOrderData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Handle pricing update from dynamic pricing system
  const handlePricingUpdate = (pricingData) => {
    // Update order items with dynamic pricing
    const updatedItems = orderData.items.map((item) => ({
      ...item,
      dynamic_price: pricingData.price_eur,
      original_price: item.unit_price,
      price_breakdown: pricingData.breakdown,
    }));

    setOrderData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Handle tax update from tax calculator
  const handleTaxUpdate = (taxData) => {
    setOrderData((prev) => ({
      ...prev,
      tax_amount: taxData.tax_amount,
      tax_breakdown: taxData.breakdown,
      tax_region: taxData.region,
      currency: taxData.currency,
    }));
  };

  // Handle schedule update
  const handleScheduleUpdate = (scheduleData) => {
    setOrderData((prev) => ({
      ...prev,
      delivery_date: scheduleData.delivery_date,
      preferred_time: scheduleData.preferred_time,
      distributor_id: scheduleData.distributor_id,
      scheduling_data: scheduleData,
    }));
  };

  // Handle special instructions update
  const handleInstructionsUpdate = (instructions) => {
    setOrderData((prev) => ({
      ...prev,
      special_instructions: instructions,
    }));
  };

  // Validate order
  const validateOrder = () => {
    const newErrors = {};

    if (!orderData.store_id) {
      newErrors.store_id = "Store is required";
    }

    if (!orderData.customer_id) {
      newErrors.customer_id = "Customer is required";
    }

    if (!orderData.order_date) {
      newErrors.order_date = "Order date is required";
    }

    if (orderData.items.length === 0) {
      newErrors.items = "At least one product is required";
    }

    if (
      orderData.delivery_date &&
      new Date(orderData.delivery_date) < new Date(orderData.order_date)
    ) {
      newErrors.delivery_date = "Delivery date cannot be before order date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit order
  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validateOrder()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsSaving(true);

    try {
      const submitData = {
        ...orderData,
        status: isDraft ? "draft" : "pending",
        items: orderData.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          notes: item.notes,
        })),
      };

      const response = await orderService.createOrder(submitData);

      if (response.success) {
        toast.success(
          isDraft ? "Order saved as draft" : "Order created successfully"
        );
        navigate(`/orders/${response.data.id}`);
      } else {
        toast.error(response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error creating order");
    } finally {
      setIsSaving(false);
    }
  };

  // Format currency
  const formatCurrency = (amount, currency = "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (product.category &&
        product.category.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Sections for navigation
  const sections = [
    {
      id: "basic",
      label: "Basic Info",
      icon: FileText,
      completed: !!(orderData.store_id && orderData.customer_id),
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      completed: orderData.items.length > 0,
    },
    {
      id: "pricing",
      label: "Pricing",
      icon: Calculator,
      completed: orderData.dynamic_pricing_enabled,
    },
    {
      id: "taxes",
      label: "Taxes",
      icon: Percent,
      completed: orderData.tax_calculation_enabled,
    },
    {
      id: "scheduling",
      label: "Scheduling",
      icon: Calendar,
      completed: !!orderData.delivery_date,
    },
    {
      id: "instructions",
      label: "Instructions",
      icon: MessageSquare,
      completed: !!orderData.special_instructions,
    },
    { id: "summary", label: "Summary", icon: CheckCircle, completed: false },
  ];

  // Product Modal
  const ProductModal = () => (
    <AnimatePresence>
      {showProductModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowProductModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Add Products</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowProductModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  icon={<Search className="w-4 h-4 text-gray-400" />}
                />
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedProduct?.id === product.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded">
                        <Package className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.category}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(
                              product.price_eur || product.price,
                              orderData.currency
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            Stock: {product.stock_quantity || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedProduct && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setProductQuantity(Math.max(1, productQuantity - 1))
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          value={productQuantity}
                          onChange={(e) =>
                            setProductQuantity(parseInt(e.target.value) || 1)
                          }
                          min="1"
                          className="w-20 text-center"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setProductQuantity(productQuantity + 1)
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Line Total
                      </label>
                      <div className="text-xl font-bold text-green-600">
                        {formatCurrency(
                          (selectedProduct.price_eur || selectedProduct.price) *
                            productQuantity,
                          orderData.currency
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedProduct(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addProductToOrder}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Order
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/orders"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create Enhanced Order
                </h1>
                <p className="text-gray-600">
                  Advanced order creation with smart pricing and scheduling
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={isSaving || orderData.items.length === 0}
              >
                {isSaving ? (
                  <Clock className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Create Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Section Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Order Sections</h3>
              </CardHeader>
              <CardBody>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === section.id
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{section.label}</span>
                        {section.completed && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Progress Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">
                        {sections.filter((s) => s.completed).length}/
                        {sections.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (sections.filter((s) => s.completed).length /
                              sections.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            {activeSection === "basic" && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    Basic Order Information
                  </h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Store *
                      </label>
                      <select
                        value={orderData.store_id}
                        onChange={(e) =>
                          handleFieldChange("store_id", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a store</option>
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.name} - {store.address}
                          </option>
                        ))}
                      </select>
                      {errors.store_id && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.store_id}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer *
                      </label>
                      <select
                        value={orderData.customer_id}
                        onChange={(e) =>
                          handleFieldChange("customer_id", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.full_name || customer.username} -{" "}
                            {customer.email}
                          </option>
                        ))}
                      </select>
                      {errors.customer_id && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.customer_id}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order Date *
                      </label>
                      <Input
                        type="date"
                        value={orderData.order_date}
                        onChange={(e) =>
                          handleFieldChange("order_date", e.target.value)
                        }
                        max={new Date().toISOString().split("T")[0]}
                      />
                      {errors.order_date && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.order_date}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={orderData.priority}
                        onChange={(e) =>
                          handleFieldChange("priority", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes
                    </label>
                    <textarea
                      value={orderData.notes}
                      onChange={(e) =>
                        handleFieldChange("notes", e.target.value)
                      }
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Any additional notes for this order..."
                    />
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Products Section */}
            {activeSection === "products" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Order Products</h3>
                    <Button onClick={() => setShowProductModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </CardHeader>
                <CardBody>
                  {orderData.items.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No products added yet
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Click "Add Product" to start building your order
                      </p>
                      <Button onClick={() => setShowProductModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orderData.items.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded">
                                <Package className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {item.product_name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {item.category}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateItemQuantity(index, item.quantity - 1)
                                  }
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateItemQuantity(index, item.quantity + 1)
                                  }
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {formatCurrency(
                                    item.total_price,
                                    orderData.currency
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatCurrency(
                                    item.unit_price,
                                    orderData.currency
                                  )}{" "}
                                  each
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeProductFromOrder(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.items && (
                    <p className="text-sm text-red-600 mt-2">{errors.items}</p>
                  )}
                </CardBody>
              </Card>
            )}

            {/* Dynamic Pricing Section */}
            {activeSection === "pricing" && (
              <DynamicPricingSystem
                orderId={null}
                onPriceUpdate={handlePricingUpdate}
                showAdvancedRules={true}
              />
            )}

            {/* Tax Calculation Section */}
            {activeSection === "taxes" && (
              <AdvancedTaxCalculator
                orderId={null}
                products={orderData.items}
                customerData={
                  customers.find((c) => c.id === orderData.customer_id) || {}
                }
                onTaxUpdate={handleTaxUpdate}
                showAdvanced={true}
              />
            )}

            {/* Scheduling Section */}
            {activeSection === "scheduling" && (
              <OrderSchedulingSystem
                orderId={null}
                onScheduleUpdate={handleScheduleUpdate}
                showFullCalendar={true}
                compactMode={false}
              />
            )}

            {/* Special Instructions Section */}
            {activeSection === "instructions" && (
              <SpecialInstructionsManager
                orderId={null}
                initialInstructions={orderData.special_instructions}
                onInstructionsChange={handleInstructionsUpdate}
                showTemplates={true}
                compactMode={false}
              />
            )}

            {/* Order Summary Section */}
            {activeSection === "summary" && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Order Summary</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Order Information
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-gray-600">Store:</span>
                            <span className="ml-2 font-medium">
                              {stores.find((s) => s.id == orderData.store_id)
                                ?.name || "Not selected"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Customer:</span>
                            <span className="ml-2 font-medium">
                              {customers.find(
                                (c) => c.id == orderData.customer_id
                              )?.full_name || "Not selected"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <span className="ml-2 font-medium">
                              {orderData.order_date}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Priority:</span>
                            <span
                              className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                                orderData.priority === "urgent"
                                  ? "bg-red-100 text-red-800"
                                  : orderData.priority === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : orderData.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {orderData.priority.charAt(0).toUpperCase() +
                                orderData.priority.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Delivery Information
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-gray-600">
                              Delivery Date:
                            </span>
                            <span className="ml-2 font-medium">
                              {orderData.delivery_date || "Not scheduled"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Assigned to:</span>
                            <span className="ml-2 font-medium">
                              {distributors.find(
                                (d) => d.id == orderData.distributor_id
                              )?.full_name || "Auto-assign"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Financial Summary
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">
                            Subtotal ({orderSummary.itemCount} items):
                          </span>
                          <span className="font-medium">
                            {formatCurrency(
                              orderSummary.subtotal,
                              orderSummary.currency
                            )}
                          </span>
                        </div>
                        {orderSummary.discounts > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Discounts:</span>
                            <span className="font-medium text-green-600">
                              -
                              {formatCurrency(
                                orderSummary.discounts,
                                orderSummary.currency
                              )}
                            </span>
                          </div>
                        )}
                        {orderSummary.taxes > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Taxes:</span>
                            <span className="font-medium">
                              {formatCurrency(
                                orderSummary.taxes,
                                orderSummary.currency
                              )}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">
                              Total Amount:
                            </span>
                            <span className="text-xl font-bold text-green-600">
                              {formatCurrency(
                                orderSummary.total,
                                orderSummary.currency
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    {orderData.special_instructions && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Special Instructions
                        </h4>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            {orderData.special_instructions}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => handleSubmit(true)}
                        disabled={isSaving}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save as Draft
                      </Button>
                      <Button
                        onClick={() => handleSubmit(false)}
                        disabled={isSaving || !validateOrder()}
                      >
                        {isSaving ? (
                          <Clock className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Create Order
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Quick Summary */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Order Summary</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">
                        {orderSummary.itemCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          orderSummary.subtotal,
                          orderSummary.currency
                        )}
                      </span>
                    </div>
                    {orderSummary.discounts > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Discounts:</span>
                        <span className="font-medium text-green-600">
                          -
                          {formatCurrency(
                            orderSummary.discounts,
                            orderSummary.currency
                          )}
                        </span>
                      </div>
                    )}
                    {orderSummary.taxes > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Taxes:</span>
                        <span className="font-medium">
                          {formatCurrency(
                            orderSummary.taxes,
                            orderSummary.currency
                          )}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatCurrency(
                            orderSummary.total,
                            orderSummary.currency
                          )}
                        </span>
                      </div>
                    </div>
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
                      onClick={() => setActiveSection("products")}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Add Products
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveSection("scheduling")}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Delivery
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveSection("instructions")}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Add Instructions
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setActiveSection("pricing")}
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Apply Discounts
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      <ProductModal />
    </div>
  );
};

export default EnhancedCreateOrderPage;
