import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Minus,
  Search,
  Calendar,
  MapPin,
  Package,
  Save,
  AlertCircle,
  ShoppingCart,
  Gift,
  Calculator,
  CheckCircle,
  Edit3,
  Store,
  FileText,
  Clock,
  DollarSign,
  ChevronDown,
  Building,
  Trash2,
} from "lucide-react";
import { formatCurrency, getLocalizedText } from "../../utils/formatters";

import { useAuthStore } from "../../store/authStore";
import { createOrder } from "../../services/ordersAPI";
import { getStores } from "../../services/storesAPI";
import { getProducts } from "../../services/productsAPI";

const CreateOrderModal = ({ isOpen, onClose, onSuccess }) => {
  // Preferences and Auth

  const { isAuthenticated, token } = useAuthStore();

  // Enhanced state management
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    store_id: "",
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    notes: "",
    discount_amount: 0,
    items: [],
  });

  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [quickAdd, setQuickAdd] = useState(false);

  // Store search states
  const [storeSearchTerm, setStoreSearchTerm] = useState("");
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  // Enhanced effects
  useEffect(() => {
    if (isOpen) {
      loadStores();
      loadProducts();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.store_id) {
      const store = stores.find(
        (s) => s.id.toString() === formData.store_id.toString()
      );
      setSelectedStore(store);
    }
  }, [formData.store_id, stores]);

  // Enhanced memoized calculations
  const orderSummary = useMemo(() => {
    const itemsSubtotal = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const itemsDiscount = formData.items.reduce(
      (sum, item) => sum + (item.discount_amount || 0),
      0
    );
    const orderDiscount = formData.discount_amount || 0;
    const totalDiscount = itemsDiscount + orderDiscount;
    const finalTotal = itemsSubtotal - totalDiscount;
    const totalQuantity = formData.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalGifts = formData.items.reduce(
      (sum, item) => sum + (item.gift_quantity || 0),
      0
    );

    return {
      itemsSubtotal,
      itemsDiscount,
      orderDiscount,
      totalDiscount,
      finalTotal,
      totalQuantity,
      totalGifts,
      itemsCount: formData.items.length,
    };
  }, [formData.items, formData.discount_amount]);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Filtered stores for search
  const filteredStores = useMemo(() => {
    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
        store.address?.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
        store.phone?.includes(storeSearchTerm)
    );
  }, [stores, storeSearchTerm]);

  const resetForm = () => {
    setFormData({
      store_id: "",
      order_date: new Date().toISOString().split("T")[0],
      delivery_date: "",
      notes: "",
      discount_amount: 0,
      items: [],
    });
    setErrors({});
    setSearchTerm("");
    setStoreSearchTerm("");
    setCurrentStep(1);
    setSelectedStore(null);
    setShowStoreDropdown(false);
  };

  const loadStores = async () => {
    if (!isAuthenticated || !token) {
      console.warn("User not authenticated, cannot load stores");
      setStores([]);
      return;
    }

    try {
      const response = await getStores();
      if (response.success) {
        const storesData = Array.isArray(response.data)
          ? response.data
          : response.data?.stores && Array.isArray(response.data.stores)
          ? response.data.stores
          : [];
        setStores(storesData);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      if (error.response?.status === 401) {
        console.error("Authentication error - user may need to login again");
      }
      setStores([]);
    }
  };

  const loadProducts = async () => {
    if (!isAuthenticated || !token) {
      console.warn("User not authenticated, cannot load products");
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await getProducts();
      console.log("Products API Response:", response); // Debug log

      if (response.success) {
        // Handle different response structures
        let productsData = [];

        if (Array.isArray(response.data)) {
          productsData = response.data;
        } else if (
          response.data?.products &&
          Array.isArray(response.data.products)
        ) {
          productsData = response.data.products;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          productsData = response.data.data;
        }

        console.log("Processed products data:", productsData); // Debug log
        setProducts(productsData);
      } else {
        console.error("Products API returned success: false", response);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      if (error.response?.status === 401) {
        console.error("Authentication error - user may need to login again");
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-set delivery date to next day if order date changes
    if (field === "order_date" && value) {
      const nextDay = new Date(value);
      nextDay.setDate(nextDay.getDate() + 1);
      setFormData((prev) => ({
        ...prev,
        delivery_date:
          prev.delivery_date || nextDay.toISOString().split("T")[0],
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleStoreSelect = (store) => {
    handleInputChange("store_id", store.id);
    setStoreSearchTerm(store.name);
    setShowStoreDropdown(false);
  };

  const addProduct = (product) => {
    const existingItem = formData.items.find(
      (item) => item.product_id === product.id
    );

    if (existingItem) {
      updateItemQuantity(existingItem.product_id, existingItem.quantity + 1);
    } else {
      const newItem = {
        product_id: product.id,
        product: product,
        quantity: 1,
        unit_price: product.price,
        discount_amount: 0,
        gift_quantity: 0,
        notes: "",
      };

      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }

    setShowProductSearch(false);
    setSearchTerm("");
  };

  const removeItem = (productId) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.product_id !== productId),
    }));
  };

  const updateItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      ),
    }));
  };

  const updateItemField = (productId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.product_id === productId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const calculateItemTotal = (item) => {
    const totalPrice = item.quantity * item.unit_price;
    return totalPrice - (item.discount_amount || 0);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.store_id) {
        newErrors.store_id = "يرجى اختيار المتجر";
      }
      if (!formData.order_date) {
        newErrors.order_date = "يرجى تحديد تاريخ الطلب";
      }
      if (!formData.delivery_date) {
        newErrors.delivery_date = "يرجى تحديد تاريخ التسليم";
      }
      if (
        formData.delivery_date &&
        formData.order_date &&
        new Date(formData.delivery_date) < new Date(formData.order_date)
      ) {
        newErrors.delivery_date = "تاريخ التسليم يجب أن يكون بعد تاريخ الطلب";
      }
    }

    if (step === 2) {
      if (formData.items.length === 0) {
        newErrors.items = "يرجى إضافة منتج واحد على الأقل";
      } else {
        // Validate each item
        const hasInvalidItems = formData.items.some(
          (item) =>
            !item.quantity ||
            item.quantity <= 0 ||
            !item.unit_price ||
            item.unit_price <= 0
        );

        if (hasInvalidItems) {
          newErrors.items =
            "يرجى التأكد من صحة الكميات والأسعار لجميع المنتجات";
        }

        // Check if total amount is valid
        const totalAmount = formData.items.reduce(
          (sum, item) => sum + item.quantity * item.unit_price,
          0
        );

        if (totalAmount <= 0) {
          newErrors.items = "إجمالي قيمة الطلب يجب أن يكون أكبر من صفر";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!isAuthenticated) {
      console.warn("User must be authenticated to proceed");
      return;
    }

    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2)) {
      return;
    }

    setLoading(true);
    try {
      // Calculate totals properly
      const itemsSubtotal = formData.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0
      );
      const itemsDiscount = formData.items.reduce(
        (sum, item) => sum + (item.discount_amount || 0),
        0
      );
      const orderDiscount = formData.discount_amount || 0;
      const totalAmount = itemsSubtotal;
      const totalDiscount = itemsDiscount + orderDiscount;
      const finalAmount = Math.max(totalAmount - totalDiscount, 0);

      const orderData = {
        store_id: parseInt(formData.store_id),
        order_date: formData.order_date,
        delivery_date: formData.delivery_date,
        total_amount: totalAmount,
        discount_amount: orderDiscount,
        final_amount: finalAmount,
        notes: formData.notes,
        items: formData.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          discount_amount: parseFloat(item.discount_amount) || 0,
          gift_quantity: parseInt(item.gift_quantity) || 0,
          notes: item.notes || "",
        })),
      };

      console.log("Sending order data:", orderData); // للتشخيص

      const response = await createOrder(orderData);

      if (response.success) {
        onSuccess && onSuccess(response.data);
        onClose();
      } else {
        setErrors({ submit: response.message || "فشل في إنشاء الطلب" });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          error.message ||
          "حدث خطأ أثناء إنشاء الطلب",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Enhanced Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {getLocalizedText(
                    "create_new_order",
                    "إنشاء طلب جديد",
                    "Create New Order"
                  )}
                </h2>
                <p className="text-blue-100 text-sm">
                  {getLocalizedText(
                    "add_new_order_description",
                    "إضافة طلب جديد للمتاجر",
                    "Add a new order for stores"
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-6 space-x-reverse">
              {[
                {
                  number: 1,
                  title: getLocalizedText(
                    "order_info",
                    "معلومات الطلب",
                    "Order Info"
                  ),
                  icon: Store,
                },
                {
                  number: 2,
                  title: getLocalizedText("products", "المنتجات", "Products"),
                  icon: Package,
                },
                {
                  number: 3,
                  title: getLocalizedText("review", "المراجعة", "Review"),
                  icon: CheckCircle,
                },
              ].map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      currentStep >= step.number
                        ? "bg-white text-blue-600 border-white"
                        : "border-blue-300 text-blue-300"
                    }`}
                  >
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`mr-2 text-xs font-medium ${
                      currentStep >= step.number
                        ? "text-white"
                        : "text-blue-300"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < 2 && (
                    <div
                      className={`w-8 h-0.5 mr-6 ${
                        currentStep > step.number ? "bg-white" : "bg-blue-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Authentication Warning */}
        {!isAuthenticated && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <p className="text-yellow-800">
                {getLocalizedText(
                  "auth_required_warning",
                  "يرجى تسجيل الدخول أولاً لإنشاء طلب جديد",
                  "Please login first to create a new order"
                )}
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Step 1: Order Information */}
            {currentStep === 1 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {getLocalizedText(
                      "basic_order_info",
                      "معلومات الطلب الأساسية",
                      "Basic Order Information"
                    )}
                  </h3>
                  <p className="text-gray-600">
                    {getLocalizedText(
                      "enter_order_details",
                      "أدخل تفاصيل الطلب والمتجر",
                      "Enter order and store details"
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Enhanced Store Selection with Search */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Building className="inline h-4 w-4 mr-2" />
                      {getLocalizedText(
                        "select_store",
                        "اختيار المتجر *",
                        "Select Store *"
                      )}
                    </label>

                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={getLocalizedText(
                            "search_store_placeholder",
                            "ابحث عن متجر بالاسم أو العنوان...",
                            "Search for store by name or address..."
                          )}
                          value={storeSearchTerm}
                          onChange={(e) => {
                            setStoreSearchTerm(e.target.value);
                            setShowStoreDropdown(true);
                          }}
                          onFocus={() => setShowStoreDropdown(true)}
                          className={`w-full pr-12 pl-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.store_id
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        <ChevronDown className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>

                      {/* Store Dropdown */}
                      {showStoreDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredStores.length > 0 ? (
                            filteredStores.map((store) => (
                              <div
                                key={store.id}
                                onClick={() => handleStoreSelect(store)}
                                className={`p-4 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                                  formData.store_id === store.id
                                    ? "bg-blue-50 border-blue-200"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {store.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {store.address}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {store.phone}
                                    </p>
                                  </div>
                                  {formData.store_id === store.id && (
                                    <CheckCircle className="h-5 w-5 text-blue-500" />
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              {getLocalizedText(
                                "no_stores_found",
                                "لا توجد متاجر تطابق البحث",
                                "No stores found matching search"
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {errors.store_id && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.store_id}
                      </p>
                    )}

                    {/* Selected Store Preview */}
                    {selectedStore && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Store className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-900">
                              {selectedStore.name}
                            </h4>
                            <p className="text-sm text-blue-700">
                              {selectedStore.address}
                            </p>
                            <p className="text-sm text-blue-600">
                              {selectedStore.phone}
                            </p>
                          </div>
                          <CheckCircle className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-2" />
                        {getLocalizedText(
                          "order_date",
                          "تاريخ الطلب *",
                          "Order Date *"
                        )}
                      </label>
                      <input
                        type="date"
                        value={formData.order_date}
                        onChange={(e) =>
                          handleInputChange("order_date", e.target.value)
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.order_date
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.order_date && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.order_date}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="inline h-4 w-4 mr-2" />
                        {getLocalizedText(
                          "delivery_date",
                          "تاريخ التسليم *",
                          "Delivery Date *"
                        )}
                      </label>
                      <input
                        type="date"
                        value={formData.delivery_date}
                        onChange={(e) =>
                          handleInputChange("delivery_date", e.target.value)
                        }
                        min={formData.order_date}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.delivery_date
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.delivery_date && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.delivery_date}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {getLocalizedText(
                        "quick_stats",
                        "إحصائيات سريعة",
                        "Quick Stats"
                      )}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">
                          {getLocalizedText(
                            "total_stores",
                            "إجمالي المتاجر:",
                            "Total Stores:"
                          )}
                        </span>
                        <div className="font-semibold text-gray-900">
                          {Array.isArray(stores) ? stores.length : 0}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          {getLocalizedText(
                            "available_products",
                            "المنتجات المتاحة:",
                            "Available Products:"
                          )}
                        </span>
                        <div className="font-semibold text-gray-900">
                          {Array.isArray(products) ? products.length : 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-2" />
                    {getLocalizedText(
                      "order_notes",
                      "ملاحظات الطلب",
                      "Order Notes"
                    )}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    placeholder={getLocalizedText(
                      "order_notes_placeholder",
                      "أضف أي ملاحظات خاصة بالطلب...",
                      "Add any special notes for the order..."
                    )}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Products */}
            {currentStep === 2 && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {getLocalizedText(
                        "select_products",
                        "اختيار المنتجات",
                        "Select Products"
                      )}
                    </h3>
                    <p className="text-gray-600">
                      {getLocalizedText(
                        "add_required_products",
                        "أضف المنتجات المطلوبة للطلب",
                        "Add required products for the order"
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProductSearch(!showProductSearch)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    {getLocalizedText(
                      "add_product",
                      "إضافة منتج",
                      "Add Product"
                    )}
                  </button>
                </div>

                {errors.items && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700">{errors.items}</p>
                  </div>
                )}

                {/* Enhanced Product Search */}
                {showProductSearch && (
                  <div className="bg-gray-50 p-6 rounded-xl border">
                    <div className="relative mb-4">
                      <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder={getLocalizedText(
                          "search_product_placeholder",
                          "ابحث عن منتج بالاسم أو الكود...",
                          "Search for product by name or code..."
                        )}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-3 text-gray-600">
                            {getLocalizedText(
                              "loading_products",
                              "جاري تحميل المنتجات...",
                              "Loading products..."
                            )}
                          </span>
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            {!isAuthenticated
                              ? getLocalizedText(
                                  "login_required",
                                  "يرجى تسجيل الدخول لعرض المنتجات",
                                  "Please login to view products"
                                )
                              : products.length === 0
                              ? getLocalizedText(
                                  "no_products_available",
                                  "لا توجد منتجات متاحة",
                                  "No products available"
                                )
                              : getLocalizedText(
                                  "no_products_found",
                                  "لم يتم العثور على منتجات",
                                  "No products found"
                                )}
                          </p>
                          {products.length === 0 && isAuthenticated && (
                            <button
                              type="button"
                              onClick={loadProducts}
                              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              {getLocalizedText(
                                "retry",
                                "إعادة المحاولة",
                                "Retry"
                              )}
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              onClick={() => addProduct(product)}
                              className="p-4 bg-white rounded-lg border hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {product.name}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {product.unit}
                                  </p>
                                  <p className="text-sm font-medium text-blue-600 mt-1">
                                    {formatCurrency(product.price)}
                                  </p>
                                </div>
                                <Plus className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Enhanced Selected Items */}
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div
                      key={item.product_id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {item.product.unit}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الكمية
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              type="button"
                              onClick={() =>
                                updateItemQuantity(
                                  item.product_id,
                                  item.quantity - 1
                                )
                              }
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItemQuantity(
                                  item.product_id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="flex-1 px-3 py-2 text-center border-0 focus:outline-none"
                              min="1"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateItemQuantity(
                                  item.product_id,
                                  item.quantity + 1
                                )
                              }
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            سعر الوحدة
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) =>
                                updateItemField(
                                  item.product_id,
                                  "unit_price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              step="0.01"
                            />
                          </div>
                        </div>

                        {/* Discount */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            الخصم
                          </label>
                          <input
                            type="number"
                            value={item.discount_amount}
                            onChange={(e) =>
                              updateItemField(
                                item.product_id,
                                "discount_amount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            step="0.01"
                          />
                        </div>

                        {/* Gift Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Gift className="inline h-4 w-4 mr-1" />
                            هدية
                          </label>
                          <input
                            type="number"
                            value={item.gift_quantity}
                            onChange={(e) =>
                              updateItemField(
                                item.product_id,
                                "gift_quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>

                        {/* Total */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            المجموع
                          </label>
                          <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <span className="font-medium text-green-700">
                              {formatCurrency(calculateItemTotal(item))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ملاحظات المنتج
                        </label>
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) =>
                            updateItemField(
                              item.product_id,
                              "notes",
                              e.target.value
                            )
                          }
                          placeholder="أضف ملاحظات خاصة بهذا المنتج..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {formData.items.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      لا توجد منتجات مضافة
                    </h3>
                    <p className="text-gray-500 mb-4">
                      ابدأ بإضافة منتجات للطلب
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowProductSearch(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة منتج
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="p-6 space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    مراجعة الطلب
                  </h3>
                  <p className="text-gray-600">
                    تأكد من صحة جميع التفاصيل قبل الإرسال
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Details */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      تفاصيل الطلب
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">المتجر:</span>
                        <span className="font-medium">
                          {selectedStore?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ الطلب:</span>
                        <span className="font-medium">
                          {formData.order_date}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ التسليم:</span>
                        <span className="font-medium">
                          {formData.delivery_date}
                        </span>
                      </div>
                      {formData.notes && (
                        <div>
                          <span className="text-gray-600">الملاحظات:</span>
                          <p className="text-sm text-gray-900 mt-1">
                            {formData.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Order Summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-blue-600" />
                      {getLocalizedText(
                        "order_summary",
                        "ملخص الطلب",
                        "Order Summary"
                      )}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {getLocalizedText(
                            "products_count",
                            "عدد المنتجات:",
                            "Products Count:"
                          )}
                        </span>
                        <span className="font-medium">
                          {orderSummary.itemsCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {getLocalizedText(
                            "total_quantity",
                            "إجمالي الكمية:",
                            "Total Quantity:"
                          )}
                        </span>
                        <span className="font-medium">
                          {orderSummary.totalQuantity}
                        </span>
                      </div>
                      {orderSummary.totalGifts > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {getLocalizedText(
                              "total_gifts",
                              "إجمالي الهدايا:",
                              "Total Gifts:"
                            )}
                          </span>
                          <span className="font-medium text-green-600">
                            {orderSummary.totalGifts}
                          </span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {getLocalizedText(
                              "subtotal",
                              "المجموع الفرعي:",
                              "Subtotal:"
                            )}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(orderSummary.itemsSubtotal)}
                          </span>
                        </div>
                        {orderSummary.totalDiscount > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>
                              {getLocalizedText(
                                "total_discount",
                                "إجمالي الخصم:",
                                "Total Discount:"
                              )}
                            </span>
                            <span>
                              -{formatCurrency(orderSummary.totalDiscount)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-green-600 mt-2 pt-2 border-t border-gray-200">
                          <span>
                            {getLocalizedText(
                              "final_total",
                              "المجموع النهائي:",
                              "Final Total:"
                            )}
                          </span>
                          <span>{formatCurrency(orderSummary.finalTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Discount */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {getLocalizedText(
                          "additional_order_discount",
                          "خصم إضافي على الطلب",
                          "Additional Order Discount"
                        )}
                      </label>
                      <input
                        type="number"
                        value={formData.discount_amount}
                        onChange={(e) =>
                          handleInputChange(
                            "discount_amount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Items Preview */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">
                    {getLocalizedText(
                      "required_products",
                      "المنتجات المطلوبة",
                      "Required Products"
                    )}
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {formData.items.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {item.product.name}
                            </h5>
                            <p className="text-sm text-gray-500">
                              {item.quantity} ×{" "}
                              {formatCurrency(item.unit_price)}
                              {item.gift_quantity > 0 && (
                                <span className="text-green-600 mr-2">
                                  + {item.gift_quantity}{" "}
                                  {getLocalizedText("gift", "هدية", "gift")}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(calculateItemTotal(item))}
                          </div>
                          {item.discount_amount > 0 && (
                            <div className="text-sm text-red-600">
                              {getLocalizedText(
                                "discount",
                                "خصم:",
                                "Discount:"
                              )}{" "}
                              {formatCurrency(item.discount_amount)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {errors.submit && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700">{errors.submit}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Footer - Fixed */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {getLocalizedText("previous", "السابق", "Previous")}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {getLocalizedText("cancel", "إلغاء", "Cancel")}
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!isAuthenticated}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {getLocalizedText("next", "التالي", "Next")}
                    <span className="text-xs">({currentStep}/3)</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={
                      loading || formData.items.length === 0 || !isAuthenticated
                    }
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        {getLocalizedText(
                          "creating",
                          "جاري الإنشاء...",
                          "Creating..."
                        )}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {getLocalizedText(
                          "create_order",
                          "إنشاء الطلب",
                          "Create Order"
                        )}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Click outside to close dropdown */}
        {showStoreDropdown && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowStoreDropdown(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CreateOrderModal;
