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
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingDistributors, setLoadingDistributors] = useState(true);

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
      const response = await storeService.getStores({ status: "active" });
      const storesData = response.data || response;
      setStores(storesData.stores || storesData || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("خطأ في تحميل المتاجر");
    } finally {
      setLoadingStores(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productService.getProducts({ status: "active" });
      const productsData = response.data || response;
      setProducts(productsData.products || productsData || []);
    } catch (error) {
      console.error("Error fetching products:", error);
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
      const usersData = response.data || response;
      const distributorsList = usersData.users || usersData || [];
      console.log("Distributors loaded:", distributorsList); // Debug log
      setDistributors(distributorsList);
    } catch (error) {
      console.error("Error fetching distributors:", error);
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

      // Prepare order data according to API expectations
      const orderData = {
        store_id: parseInt(formData.store_id),
        currency: "EUR",
        delivery_date: formData.delivery_date || null,
        notes: formData.notes || "",
        items: formData.items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          notes: item.notes || "",
        })),
      };

      // Log the data being sent
      console.log(
        "📦 Order data being sent:",
        JSON.stringify(orderData, null, 2)
      );
      console.log("📊 Form data details:", {
        storeId: formData.store_id,
        storeIdType: typeof formData.store_id,
        storeIdParsed: parseInt(formData.store_id),
        itemsCount: formData.items.length,
        items: formData.items.map((item, index) => ({
          index,
          product_id: item.product_id,
          product_id_type: typeof item.product_id,
          product_id_parsed: parseInt(item.product_id),
          quantity: item.quantity,
          quantity_type: typeof item.quantity,
          quantity_parsed: parseInt(item.quantity),
          notes: item.notes,
        })),
      });

      const response = await orderService.createOrder(orderData);

      console.log("✅ Order creation response:", response);

      if (response.success || response.data) {
        toast.success("تم إنشاء الطلب بنجاح");

        // If distributor was selected and order created successfully, we can assign it later
        if (distributorId && response.data?.id) {
          try {
            // This would require an API call to assign distributor
            console.log(
              "Distributor to assign:",
              distributorId,
              "to order:",
              response.data.id
            );
            // TODO: Add distributor assignment API call here if needed
          } catch (assignError) {
            console.warn("Could not assign distributor:", assignError);
          }
        }

        navigate("/orders");
      } else {
        console.error("❌ Order creation failed - Invalid response:", response);
        toast.error(response.message || "خطأ في إنشاء الطلب");
      }
    } catch (error) {
      console.error("💥 Error creating order:", error);

      // Log detailed error information
      if (error.response) {
        console.error("📄 Error response data:", error.response.data);
        console.error("📊 Error response status:", error.response.status);
        console.error("📋 Error response headers:", error.response.headers);

        // If it's a 400 error, log validation details
        if (error.response.status === 400) {
          console.error("🔍 400 Bad Request Details:", {
            message: error.response.data?.message,
            errors: error.response.data?.errors,
            data: error.response.data,
          });
        }
      } else if (error.request) {
        console.error("📡 Error request:", error.request);
      } else {
        console.error("⚠️ Error message:", error.message);
      }

      const errorMessage =
        error.response?.data?.message || error.message || "خطأ في إنشاء الطلب";
      toast.error(errorMessage);

      // Handle validation errors from API
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach((err) => {
          apiErrors[err.field] = err.message;
        });
        setFormErrors(apiErrors);
        console.error("📝 Validation errors set:", apiErrors);
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
                                    </option>
                                  ))}
                                </select>
                                {formErrors[`items[${index}].product_id`] && (
                                  <p className="mt-1 text-xs text-red-600">
                                    {formErrors[`items[${index}].product_id`]}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  الكمية <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(
                                      item.id,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
                                    formErrors[`items[${index}].quantity`]
                                      ? "border-red-300 bg-red-50"
                                      : "border-gray-300"
                                  }`}
                                  required
                                />
                                {formErrors[`items[${index}].quantity`] && (
                                  <p className="mt-1 text-xs text-red-600">
                                    {formErrors[`items[${index}].quantity`]}
                                  </p>
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
