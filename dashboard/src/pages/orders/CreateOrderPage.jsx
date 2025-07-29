import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  ShoppingCart,
  Euro,
  Calendar,
  Package,
  Store,
  User,
  FileText,
  Truck,
  Save,
  ArrowLeft,
  Building,
  Phone,
  MapPin,
  Calculator,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import orderService from "../../services/orderService.js";
import storeService from "../../services/storeService";
import productService from "../../services/productService";
import userService from "../../services/userService";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const CreateOrderPage = () => {
  const navigate = useNavigate();

  // Form state - simplified to match API expectations
  const [formData, setFormData] = useState({
    store_id: "",
    delivery_date: "",
    notes: "",
    currency: "EUR", // Always EUR only
    items: [],
  });

  // Additional form state for UI only (not sent to API)
  const [distributorId, setDistributorId] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Loading and data states
  const [loading, setLoading] = useState(false);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingDistributors, setLoadingDistributors] = useState(true);
  const [lastError, setLastError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);

  // Selected details for display
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedDistributor, setSelectedDistributor] = useState(null);

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([fetchStores(), fetchProducts(), fetchDistributors()]);
  };

  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const response = await storeService.getStores();
      if (response && response.success !== false) {
        const storesData = response.data || response;
        setStores(storesData.stores || storesData || []);
      } else {
        console.warn("Failed to load stores, using empty array");
        setStores([]);
        toast.error("فشل في تحميل المتاجر");
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStores([]);
      toast.error("خطأ في تحميل المتاجر");
    } finally {
      setLoadingStores(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productService.getProducts({ status: "active" });
      if (response && response.success !== false) {
        const productsData = response.data || response;
        setProducts(productsData.products || productsData || []);
      } else {
        console.warn("Failed to load products, using empty array");
        setProducts([]);
        toast.error("فشل في تحميل المنتجات");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      toast.error("خطأ في تحميل المنتجات");
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchDistributors = async () => {
    try {
      setLoadingDistributors(true);
      const response = await userService.getUsers({
        role: "distributor",
        status: "active",
      });
      if (response && response.success !== false) {
        const usersData = response.data || response;
        const distributorsList = usersData.users || usersData || [];
        console.log("Distributors loaded:", distributorsList); // Debug log
        setDistributors(distributorsList);
      } else {
        console.warn("Failed to load distributors, using empty array");
        setDistributors([]);
        toast.error("فشل في تحميل الموزعين");
      }
    } catch (error) {
      console.error("Error fetching distributors:", error);
      setDistributors([]);
      toast.error("خطأ في تحميل الموزعين");
    } finally {
      setLoadingDistributors(false);
    }
  };

  // Handle store selection
  const handleStoreChange = (storeId) => {
    const store = stores.find((s) => s.id === parseInt(storeId));
    setSelectedStore(store);
    setFormData((prev) => ({ ...prev, store_id: storeId }));
    // Clear store error if exists
    if (formErrors.store_id) {
      setFormErrors((prev) => ({ ...prev, store_id: null }));
    }
  };

  // Handle distributor selection
  const handleDistributorChange = (distributorId) => {
    const distributor = distributors.find(
      (d) => d.id === parseInt(distributorId)
    );
    setSelectedDistributor(distributor);
    setDistributorId(distributorId);
  };

  // Add new item to order
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      product_id: "",
      quantity: 1,
      notes: "",
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    // Clear items error if exists
    if (formErrors.items) {
      setFormErrors((prev) => ({ ...prev, items: null }));
    }
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

    // Clear specific item error if exists
    const itemIndex = formData.items.findIndex((item) => item.id === itemId);
    if (formErrors[`items[${itemIndex}].${field}`]) {
      setFormErrors((prev) => ({
        ...prev,
        [`items[${itemIndex}].${field}`]: null,
      }));
    }
  };

  // Get product by ID
  const getProduct = (productId) => {
    return products.find((product) => product.id === parseInt(productId));
  };

  // Calculate item total (EUR only)
  const calculateItemTotal = (item) => {
    const product = getProduct(item.product_id);
    if (!product) return 0;

    const quantity = parseInt(item.quantity) || 0;
    return (parseFloat(product.price_eur) || 0) * quantity;
  };

  // Calculate order total (EUR only)
  const calculateOrderTotal = () => {
    return formData.items.reduce(
      (total, item) => total + calculateItemTotal(item),
      0
    );
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    // Validate store
    if (!formData.store_id) {
      errors.store_id = "يرجى اختيار المتجر";
    }

    // Validate items
    if (formData.items.length === 0) {
      errors.items = "يرجى إضافة منتج واحد على الأقل";
    } else {
      formData.items.forEach((item, index) => {
        if (!item.product_id) {
          errors[`items[${index}].product_id`] = `يرجى اختيار المنتج للعنصر ${
            index + 1
          }`;
        }
        if (!item.quantity || parseInt(item.quantity) < 1) {
          errors[`items[${index}].quantity`] = `يرجى إدخال كمية صحيحة للعنصر ${
            index + 1
          }`;
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("يرجى التأكد من صحة البيانات المدخلة");
      return;
    }

    try {
      setLoading(true);

      // Check authentication token first
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("auth_token="))
        ?.split("=")[1];

      console.log(
        "🔐 Auth token status:",
        token ? "Token exists" : "No token found"
      );

      if (!token) {
        toast.error("جلسة المستخدم منتهية، يرجى تسجيل الدخول مرة أخرى");
        return;
      }

      // Frontend inventory validation before sending to backend
      console.log("🔍 [FRONTEND] Performing inventory validation...");
      const inventoryErrors = [];

      for (const item of formData.items) {
        const product = getProduct(item.product_id);
        if (product) {
          const requestedQuantity = parseInt(item.quantity);

          // Check if product has stock tracking enabled
          if (
            product.stock_quantity !== null &&
            product.stock_quantity !== undefined
          ) {
            if (requestedQuantity > product.stock_quantity) {
              inventoryErrors.push({
                productName: product.name,
                requested: requestedQuantity,
                available: product.stock_quantity,
              });
            }
          }

          console.log(
            `📦 [FRONTEND] Product ${
              product.name
            }: requested ${requestedQuantity}, available ${
              product.stock_quantity || "unlimited"
            }`
          );
        }
      }

      // If there are inventory errors, show them and stop submission
      if (inventoryErrors.length > 0) {
        console.log(
          "❌ [FRONTEND] Inventory validation failed:",
          inventoryErrors
        );

        const errorMessages = inventoryErrors
          .map(
            (error) =>
              `• ${error.productName}: مطلوب ${error.requested}، متوفر ${error.available}`
          )
          .join("\n");

        toast.error(`كميات غير متوفرة:\n${errorMessages}`, {
          duration: 8000,
        });

        setLoading(false);
        return;
      }

      console.log("✅ [FRONTEND] Inventory validation passed");

      // Prepare order data
      const orderData = {
        ...formData,
        items: formData.items.map((item) => ({
          ...item,
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
        })),
      };

      console.log("🚀 [FRONTEND] Sending order data:", orderData);

      const response = await orderService.createOrder(orderData);

      if (response && response.success !== false) {
        console.log("✅ [FRONTEND] Order created successfully:", response);
        toast.success("تم إنشاء الطلب بنجاح");
        navigate("/orders");
      } else {
        const errorMessage = response?.message || "فشل في إنشاء الطلب";
        console.error("❌ [FRONTEND] Order creation failed:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("💥 [FRONTEND] Error creating order:", error);
      let errorMessage = "خطأ في إنشاء الطلب";

      if (error.response?.status === 400) {
        errorMessage =
          "بيانات الطلب غير صحيحة - يرجى التحقق من المعلومات المدخلة";
      } else if (error.response?.status === 401) {
        errorMessage = "جلسة المستخدم منتهية، يرجى تسجيل الدخول مرة أخرى";
      } else if (error.response?.status === 403) {
        errorMessage = "غير مصرح لك بإنشاء طلبات";
      } else if (error.response?.status >= 500) {
        errorMessage = "خطأ في الخادم - يرجى المحاولة مرة أخرى لاحقاً";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific inventory error messages
      if (
        errorMessage.includes("not available for product") &&
        errorMessage.includes("Available:")
      ) {
        const match = errorMessage.match(
          /Required quantity \((\d+)\) not available for product (.+)\. Available: (\d+)/
        );
        if (match) {
          const [, requested, productName, available] = match;
          errorMessage = `الكمية المطلوبة (${requested}) غير متوفرة للمنتج "${productName}". الكمية المتوفرة: ${available}`;
        }
      }

      // Handle other common error messages
      if (
        errorMessage.includes("Product") &&
        errorMessage.includes("not found")
      ) {
        errorMessage = "المنتج المحدد غير موجود";
      } else if (errorMessage.includes("Store not found")) {
        errorMessage = "المتجر المحدد غير موجود";
      } else if (errorMessage.includes("Invalid data")) {
        errorMessage = "البيانات المدخلة غير صحيحة";
      } else if (errorMessage.includes("Quantity must be greater than zero")) {
        errorMessage = "يجب أن تكون الكمية أكبر من الصفر";
      } else if (errorMessage.includes("Error creating order")) {
        errorMessage =
          "خطأ في إنشاء الطلب - يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني";
      }

      // Show error with retry option for 500 errors
      if (error.response?.status === 500) {
        toast.error(
          `${errorMessage}\n\nيمكنك المحاولة مرة أخرى أو التواصل مع الدعم الفني إذا استمرت المشكلة.`,
          {
            duration: 10000,
            icon: "⚠️",
          }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loadingStores || loadingProducts || loadingDistributors) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // Calculate order total for display
  const orderTotal = calculateOrderTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <EnhancedButton
                onClick={() => navigate("/orders")}
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                العودة
              </EnhancedButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingCart className="w-7 h-7 text-blue-600" />
                  إنشاء طلب جديد
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  قم بإضافة تفاصيل الطلب وتعيين الموزع
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <EnhancedButton
                type="submit"
                form="orderForm"
                loading={loading}
                variant="primary"
                size="lg"
                icon={<Save className="w-4 h-4" />}
              >
                حفظ الطلب
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="orderForm" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Store Selection */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-600" />
                    اختيار المتجر
                    <span className="text-red-500 text-sm">*</span>
                  </h2>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المتجر <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.store_id}
                        onChange={(e) => handleStoreChange(e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-colors ${
                          formErrors.store_id
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        required
                      >
                        <option value="" className="text-gray-500">
                          اختر المتجر
                        </option>
                        {stores.map((store) => (
                          <option
                            key={store.id}
                            value={store.id}
                            className="text-gray-900"
                          >
                            {store.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.store_id && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {formErrors.store_id}
                        </p>
                      )}
                    </div>

                    {selectedStore && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border"
                      >
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          تفاصيل المتجر
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-500" />
                            <span>{selectedStore.phone || "غير محدد"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span>{selectedStore.address || "غير محدد"}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Order Details */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    تفاصيل الطلب
                  </h2>
                </CardHeader>
                <CardBody>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ التسليم المطلوب
                    </label>
                    <EnhancedInput
                      type="date"
                      value={formData.delivery_date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          delivery_date: e.target.value,
                        }))
                      }
                      icon={<Calendar className="w-4 h-4" />}
                      className="bg-white"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ملاحظات عامة
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      rows="3"
                      placeholder="أضف أي ملاحظات عامة للطلب..."
                    />
                  </div>
                </CardBody>
              </Card>

              {/* Enhanced Distributor Assignment */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-purple-600" />
                    تعيين الموزع
                    <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                      اختياري
                    </span>
                  </h2>
                </CardHeader>
                <CardBody>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموزع المسؤول عن التوصيل
                    </label>
                    <select
                      value={distributorId}
                      onChange={(e) => handleDistributorChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900 hover:border-gray-400 transition-colors"
                    >
                      <option value="" className="text-gray-500">
                        اختر الموزع (اختياري)
                      </option>
                      {distributors.map((distributor) => (
                        <option
                          key={distributor.id}
                          value={distributor.id}
                          className="text-gray-900 py-2"
                        >
                          {distributor.name || distributor.full_name}{" "}
                          {distributor.phone ? `- ${distributor.phone}` : ""}
                        </option>
                      ))}
                    </select>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <AlertTriangle className="w-4 h-4 inline mr-1 text-orange-500" />
                        تعليمات خاصة للتسليم
                      </label>
                      <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        rows="2"
                        placeholder="تعليمات خاصة للموزع (مواعيد محددة، متطلبات خاصة، إلخ)..."
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Enhanced Order Items */}
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      منتجات الطلب
                      <span className="text-red-500 text-sm">*</span>
                      {formData.items.length > 0 && (
                        <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full">
                          {formData.items.length} منتج
                        </span>
                      )}
                    </h2>
                    <EnhancedButton
                      type="button"
                      onClick={addItem}
                      variant="primary"
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                    >
                      إضافة منتج
                    </EnhancedButton>
                  </div>
                </CardHeader>
                <CardBody>
                  {formErrors.items && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {formErrors.items}
                      </p>
                    </div>
                  )}

                  {formData.items.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        لم يتم إضافة أي منتجات بعد
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        انقر على "إضافة منتج" لبدء إنشاء الطلب
                      </p>
                      <EnhancedButton
                        type="button"
                        onClick={addItem}
                        variant="primary"
                        icon={<Plus className="w-4 h-4" />}
                      >
                        إضافة أول منتج
                      </EnhancedButton>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.items.map((item, index) => {
                        const product = getProduct(item.product_id);
                        const itemTotal = calculateItemTotal(item);

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                  منتج #{index + 1}
                                </span>
                              </h4>
                              <EnhancedButton
                                type="button"
                                onClick={() => removeItem(item.id)}
                                variant="danger"
                                size="sm"
                                icon={<Trash2 className="w-4 h-4" />}
                              >
                                حذف
                              </EnhancedButton>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  المنتج <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={item.product_id}
                                  onChange={(e) =>
                                    updateItem(
                                      item.id,
                                      "product_id",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 ${
                                    formErrors[`items[${index}].product_id`]
                                      ? "border-red-300 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                  required
                                >
                                  <option value="" className="text-gray-500">
                                    اختر المنتج
                                  </option>
                                  {products.map((product) => (
                                    <option
                                      key={product.id}
                                      value={product.id}
                                      className="text-gray-900"
                                    >
                                      {product.name} - €
                                      {parseFloat(
                                        product.price_eur || 0
                                      ).toFixed(2)}
                                      {product.stock_quantity !== null &&
                                      product.stock_quantity !== undefined
                                        ? ` (متوفر: ${product.stock_quantity})`
                                        : " (غير محدود)"}
                                    </option>
                                  ))}
                                </select>
                                {formErrors[`items[${index}].product_id`] && (
                                  <p className="mt-1 text-xs text-red-600">
                                    {formErrors[`items[${index}].product_id`]}
                                  </p>
                                )}

                                {/* Stock availability info */}
                                {product && (
                                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-blue-700 font-medium">
                                        {product.stock_quantity !== null &&
                                        product.stock_quantity !== undefined
                                          ? `الكمية المتوفرة: ${
                                              product.stock_quantity
                                            } ${product.unit || "قطعة"}`
                                          : "الكمية غير محدودة"}
                                      </span>
                                      {product.stock_quantity !== null && (
                                        <span className="text-orange-600 font-medium flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3" />
                                          مخزون قليل
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  الكمية <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max={product?.stock_quantity || undefined}
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newQuantity =
                                      parseInt(e.target.value) || 0;
                                    // Check if quantity exceeds available stock
                                    if (
                                      product?.stock_quantity !== null &&
                                      product?.stock_quantity !== undefined
                                    ) {
                                      if (
                                        newQuantity > product.stock_quantity
                                      ) {
                                        // Show warning but still allow input for user awareness
                                        toast.warn(
                                          `الكمية المطلوبة (${newQuantity}) أكبر من المتوفر (${product.stock_quantity})`
                                        );
                                      }
                                    }
                                    updateItem(
                                      item.id,
                                      "quantity",
                                      e.target.value
                                    );
                                  }}
                                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                                    formErrors[`items[${index}].quantity`] ||
                                    (product?.stock_quantity !== null &&
                                      product?.stock_quantity !== undefined &&
                                      parseInt(item.quantity) >
                                        product.stock_quantity)
                                      ? "border-red-300 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                  required
                                />

                                {/* Quantity validation messages */}
                                {product?.stock_quantity !== null &&
                                  product?.stock_quantity !== undefined &&
                                  parseInt(item.quantity) >
                                    product.stock_quantity && (
                                    <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md">
                                      <p className="text-xs text-red-600 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        الكمية المطلوبة ({item.quantity}) تتجاوز
                                        المتوفر ({product.stock_quantity})
                                      </p>
                                    </div>
                                  )}

                                {formErrors[`items[${index}].quantity`] && (
                                  <p className="mt-1 text-xs text-red-600">
                                    {formErrors[`items[${index}].quantity`]}
                                  </p>
                                )}

                                {/* Quick quantity buttons for easy selection */}
                                {product?.stock_quantity &&
                                  product.stock_quantity <= 100 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      <span className="text-xs text-gray-600 mr-2">
                                        كمية سريعة:
                                      </span>
                                      {[
                                        1,
                                        5,
                                        10,
                                        Math.min(25, product.stock_quantity),
                                        product.stock_quantity,
                                      ]
                                        .filter(
                                          (qty, idx, arr) =>
                                            arr.indexOf(qty) === idx && qty > 0
                                        )
                                        .map((qty) => (
                                          <button
                                            key={qty}
                                            type="button"
                                            onClick={() =>
                                              updateItem(
                                                item.id,
                                                "quantity",
                                                qty.toString()
                                              )
                                            }
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
                                          >
                                            {qty}
                                          </button>
                                        ))}
                                    </div>
                                  )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  المجموع الجزئي
                                </label>
                                <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                                  <span className="text-green-800 font-bold text-lg">
                                    €{itemTotal.toFixed(2)}
                                  </span>
                                  {product && (
                                    <p className="text-xs text-green-600 mt-1">
                                      {item.quantity} × €
                                      {parseFloat(
                                        product.price_eur || 0
                                      ).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                ملاحظات خاصة بالمنتج
                              </label>
                              <input
                                type="text"
                                value={item.notes}
                                onChange={(e) =>
                                  updateItem(item.id, "notes", e.target.value)
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                placeholder="ملاحظات خاصة بهذا المنتج..."
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Enhanced Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card className="shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-indigo-600" />
                      ملخص الطلب
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {/* Store Info */}
                      {selectedStore && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pb-4 border-b border-gray-200"
                        >
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Building className="w-4 h-4 text-blue-600" />
                            المتجر المختار
                          </h4>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="font-medium text-blue-900">
                              {selectedStore.name}
                            </p>
                            {selectedStore.phone && (
                              <p className="text-sm text-blue-700 mt-1 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {selectedStore.phone}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Distributor Info */}
                      {selectedDistributor && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pb-4 border-b border-gray-200"
                        >
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-600" />
                            الموزع المختار
                          </h4>
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <p className="font-medium text-purple-900">
                              {selectedDistributor.name ||
                                selectedDistributor.full_name}
                            </p>
                            {selectedDistributor.phone && (
                              <p className="text-sm text-purple-700 mt-1 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {selectedDistributor.phone}
                              </p>
                            )}
                            {selectedDistributor.email && (
                              <p className="text-sm text-purple-700 mt-1 flex items-center gap-1">
                                <span>@</span>
                                {selectedDistributor.email}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Order Summary */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">عدد المنتجات:</span>
                          <span className="font-medium bg-gray-100 px-2 py-1 rounded">
                            {formData.items.length}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">إجمالي الكمية:</span>
                          <span className="font-medium bg-gray-100 px-2 py-1 rounded">
                            {formData.items.reduce(
                              (sum, item) =>
                                sum + (parseInt(item.quantity) || 0),
                              0
                            )}
                          </span>
                        </div>

                        {/* Inventory Status Indicator */}
                        {formData.items.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                حالة المخزون:
                              </span>
                            </div>
                            <div className="space-y-1">
                              {formData.items.map((item, index) => {
                                const product = getProduct(item.product_id);
                                const requestedQty =
                                  parseInt(item.quantity) || 0;
                                const isAvailable =
                                  !product?.stock_quantity ||
                                  product.stock_quantity === null ||
                                  product.stock_quantity === undefined ||
                                  requestedQty <= product.stock_quantity;

                                if (!product || !item.product_id) return null;

                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between text-xs"
                                  >
                                    <span className="text-gray-600 truncate max-w-32">
                                      {product.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          isAvailable
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {isAvailable ? "✓ متوفر" : "⚠ غير كافي"}
                                      </span>
                                      {product.stock_quantity !== null && (
                                        <span className="text-gray-500">
                                          ({requestedQty}/
                                          {product.stock_quantity})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Overall status */}
                            {(() => {
                              const hasInsufficientStock = formData.items.some(
                                (item) => {
                                  const product = getProduct(item.product_id);
                                  const requestedQty =
                                    parseInt(item.quantity) || 0;
                                  return (
                                    product?.stock_quantity !== null &&
                                    product?.stock_quantity !== undefined &&
                                    requestedQty > product.stock_quantity
                                  );
                                }
                              );

                              return (
                                <div
                                  className={`mt-2 p-2 rounded-md border ${
                                    hasInsufficientStock
                                      ? "bg-red-50 border-red-200"
                                      : "bg-green-50 border-green-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {hasInsufficientStock ? (
                                      <>
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                        <span className="text-xs text-red-700 font-medium">
                                          بعض الكميات غير متوفرة
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-xs text-green-700 font-medium">
                                          جميع الكميات متوفرة
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-900 font-medium">
                              المجموع الإجمالي:
                            </span>
                          </div>

                          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Euro className="w-6 h-6 text-green-600" />
                                <span className="text-lg font-medium text-green-700">
                                  يورو
                                </span>
                              </div>
                              <span className="text-3xl font-bold text-green-900">
                                €{orderTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="pt-3 border-t border-gray-200">
                          <div className="space-y-2">
                            {formData.delivery_date && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  تاريخ التسليم:
                                </span>
                                <span className="text-sm font-medium flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(
                                    formData.delivery_date
                                  ).toLocaleDateString("en-GB")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Enhanced Action Buttons */}
                <div className="mt-6 space-y-3">
                  {/* Inventory Warning Banner */}
                  {(() => {
                    const hasInsufficientStock = formData.items.some((item) => {
                      const product = getProduct(item.product_id);
                      const requestedQty = parseInt(item.quantity) || 0;
                      return (
                        product?.stock_quantity !== null &&
                        product?.stock_quantity !== undefined &&
                        requestedQty > product.stock_quantity
                      );
                    });

                    if (hasInsufficientStock) {
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4"
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <AlertTriangle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">
                                تحذير: كميات غير متوفرة
                              </h3>
                              <div className="mt-2 text-sm text-red-700">
                                <p>
                                  بعض المنتجات في طلبك تحتوي على كميات أكبر من
                                  المتوفر في المخزون. يرجى مراجعة الكميات قبل
                                  المتابعة.
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }
                    return null;
                  })()}

                  <EnhancedButton
                    type="submit"
                    form="orderForm"
                    loading={loading}
                    variant="primary"
                    size="lg"
                    icon={<Save className="w-4 h-4" />}
                    className="w-full"
                  >
                    {loading ? "جاري الحفظ..." : "حفظ الطلب"}
                  </EnhancedButton>

                  <EnhancedButton
                    type="button"
                    onClick={() => navigate("/orders")}
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    إلغاء
                  </EnhancedButton>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderPage;
