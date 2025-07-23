import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Package,
  Store,
  Calendar,
  FileText,
  CheckCircle,
  Loader2,
  ShoppingCart,
  Edit3,
  Target,
  ChevronRight,
  ChevronLeft,
  Award,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import orderService from "../../services/orderService";
import productService from "../../services/productService";
import storeService from "../../services/storeService";
import autoSchedulingService from "../../services/autoSchedulingService";
import { toast } from "react-hot-toast";

const CreateOrderPage = () => {
  const navigate = useNavigate();

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-scheduling states
  const [autoSchedulingResult, setAutoSchedulingResult] = useState(null);
  const [showSchedulingResult, setShowSchedulingResult] = useState(false);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Data
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    store_id: "",
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    notes: "",
    currency: "EUR",
    priority: "normal",
    items: [],
  });

  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    product_id: "",
    product_name: "",
    quantity: 1,
    unit_price: 0,
    discount_amount: 0,
    gift_quantity: 0,
    gift_reason: "",
    notes: "",
  });

  // Steps configuration
  const steps = [
    {
      id: 1,
      title: "معلومات أساسية",
      description: "اختيار المحل والتواريخ",
      icon: Store,
      isValid: () => formData.store_id,
    },
    {
      id: 2,
      title: "إضافة المنتجات",
      description: "اختيار المنتجات والكميات",
      icon: ShoppingCart,
      isValid: () => formData.items.length > 0,
    },
    {
      id: 3,
      title: "المراجعة والملاحظات",
      description: "مراجعة الطلب وإضافة ملاحظات",
      icon: FileText,
      isValid: () => true,
    },
    {
      id: 4,
      title: "الحفظ",
      description: "حفظ الطلب واستكمال العملية",
      icon: CheckCircle,
      isValid: () => true,
    },
  ];

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    } else if (!isStepValid(currentStep)) {
      toast.error("يرجى إكمال البيانات المطلوبة قبل الانتقال للخطوة التالية");
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step) => {
    if (step <= currentStep + 1 && step >= 1) {
      setCurrentStep(step);
    }
  };

  const isStepValid = (step) => {
    const stepConfig = steps.find((s) => s.id === step);
    return stepConfig ? stepConfig.isValid() : false;
  };

  const isStepCompleted = (step) => {
    return step < currentStep || (step === currentStep && isStepValid(step));
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadStores(), loadProducts()]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("خطأ في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      const response = await storeService.getStores();
      if (response.success) {
        const storesData = response.data?.stores || response.data || [];
        setStores(Array.isArray(storesData) ? storesData : []);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts({ limit: 100 });
      if (response.success) {
        const productsData = response.data?.products || response.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  // Handle form changes
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCurrentItemChange = (field, value) => {
    setCurrentItem((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-fill product details when product is selected
      if (field === "product_id") {
        const selectedProduct = products.find((p) => p.id === parseInt(value));
        if (selectedProduct) {
          updated.product_name = selectedProduct.name;
          updated.unit_price = parseFloat(selectedProduct.price_eur || 0);
        }
      }

      return updated;
    });
  };

  // Add item to order
  const addItemToOrder = () => {
    if (!currentItem.product_id || currentItem.quantity <= 0) {
      toast.error("يرجى اختيار منتج وإدخال كمية صحيحة");
      return;
    }

    const newItem = {
      ...currentItem,
      id: Date.now(),
      product_id: parseInt(currentItem.product_id),
      product_name: currentItem.product_name,
      quantity: parseInt(currentItem.quantity),
      total_price: parseFloat(
        parseFloat(currentItem.quantity || 0) *
          parseFloat(currentItem.unit_price || 0) -
          parseFloat(currentItem.discount_amount || 0)
      ),
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset current item
    setCurrentItem({
      product_id: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      gift_quantity: 0,
      gift_reason: "",
      notes: "",
    });

    toast.success("تم إضافة المنتج إلى الطلب");
  };

  // Remove item from order
  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    toast.success("تم حذف المنتج من الطلب");
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + parseFloat(item.total_price || 0),
      0
    );
    const totalGifts = formData.items.reduce(
      (sum, item) => sum + parseFloat(item.gift_quantity || 0),
      0
    );

    return {
      subtotal,
      totalGifts,
      totalItems: formData.items.length,
    };
  };

  // Submit order
  const handleSubmit = async () => {
    if (!formData.store_id) {
      toast.error("يرجى اختيار المتجر");
      setCurrentStep(1);
      return;
    }

    if (formData.items.length === 0) {
      toast.error("يرجى إضافة منتج واحد على الأقل");
      setCurrentStep(2);
      return;
    }

    try {
      setIsSaving(true);

      const orderData = {
        store_id: parseInt(formData.store_id),
        scheduled_delivery_date:
          formData.delivery_date && formData.delivery_date.trim() !== ""
            ? formData.delivery_date
            : null,
        notes: formData.notes,
        priority: formData.priority,
        items: formData.items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
        })),
      };

      // Enable auto-scheduling by default
      orderData.enable_auto_scheduling = true;

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        // Check if auto-scheduling was performed
        if (response.data.auto_scheduling) {
          setAutoSchedulingResult(response.data.auto_scheduling);
          setShowSchedulingResult(true);
          toast.success("تم إنشاء الطلب مع اقتراح جدولة ذكي");
        } else {
          toast.success("تم إنشاء الطلب بنجاح");
          navigate("/orders");
        }
      } else {
        toast.error(response.message || "خطأ في إنشاء الطلب");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("خطأ في إنشاء الطلب");
    } finally {
      setIsSaving(false);
    }
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen text="جاري تحميل البيانات..." size="lg" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl mb-8 overflow-hidden border border-blue-100"
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <motion.button
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate("/orders")}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </motion.button>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mr-3"
                    >
                      <ShoppingCart className="w-8 h-8 text-yellow-300" />
                    </motion.div>
                    إنشاء طلب جديد
                  </h1>
                  <p className="text-white/80 mt-1">
                    أضف طلب جديد إلى النظام بسهولة
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="text-right text-white/90">
                  <div className="text-sm">
                    إجمالي المنتجات:{" "}
                    <span className="font-bold">{totals.totalItems}</span>
                  </div>
                  <div className="text-lg font-bold">
                    €{parseFloat(totals.subtotal || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Steps Progress */}
          <div className="bg-white/10 backdrop-blur-sm px-6 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="flex items-center flex-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 cursor-pointer ${
                        isStepCompleted(step.id)
                          ? "bg-white text-blue-600 border-white shadow-lg"
                          : currentStep === step.id
                          ? "bg-white/20 text-white border-white"
                          : "bg-transparent text-white/60 border-white/30"
                      }`}
                      onClick={() => goToStep(step.id)}
                    >
                      {isStepCompleted(step.id) && step.id !== currentStep ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="mr-3 text-right flex-1">
                      <div
                        className={`text-sm font-medium ${
                          currentStep === step.id
                            ? "text-white"
                            : "text-white/80"
                        }`}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-white/60">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-white/40 mx-2" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <Card className="shadow-xl border-blue-100">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                      <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-xl mr-4">
                          <Store className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            المعلومات الأساسية
                          </h2>
                          <p className="text-gray-600">
                            اختر المحل وحدد التواريخ المطلوبة
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            اختر المحل <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.store_id}
                            onChange={(e) =>
                              handleFormChange("store_id", e.target.value)
                            }
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                            required
                          >
                            <option value="">-- اختر المحل --</option>
                            {stores.map((store) => (
                              <option key={store.id} value={store.id}>
                                {store.name}
                              </option>
                            ))}
                          </select>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            تاريخ الطلب
                          </label>
                          <input
                            type="date"
                            value={formData.order_date}
                            onChange={(e) =>
                              handleFormChange("order_date", e.target.value)
                            }
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                          />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="md:col-span-2"
                        >
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            تاريخ التسليم (اختياري)
                          </label>
                          <input
                            type="date"
                            value={formData.delivery_date}
                            onChange={(e) =>
                              handleFormChange("delivery_date", e.target.value)
                            }
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                          />
                        </motion.div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Step 2: Add Products */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {/* Add New Product */}
                    <Card className="shadow-xl border-green-100">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                        <div className="flex items-center">
                          <div className="p-3 bg-green-100 rounded-xl mr-4">
                            <Plus className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              إضافة منتج جديد
                            </h2>
                            <p className="text-gray-600">
                              اختر المنتج وحدد الكمية والتفاصيل
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              اختر المنتج{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={currentItem.product_id}
                              onChange={(e) =>
                                handleCurrentItemChange(
                                  "product_id",
                                  e.target.value
                                )
                              }
                              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="">-- اختر المنتج --</option>
                              {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - €
                                  {parseFloat(product.price_eur || 0).toFixed(
                                    2
                                  )}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              الكمية <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={currentItem.quantity}
                              onChange={(e) =>
                                handleCurrentItemChange(
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              سعر الوحدة (يورو)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={currentItem.unit_price}
                              onChange={(e) =>
                                handleCurrentItemChange(
                                  "unit_price",
                                  e.target.value
                                )
                              }
                              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              مبلغ الخصم
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={currentItem.discount_amount}
                              onChange={(e) =>
                                handleCurrentItemChange(
                                  "discount_amount",
                                  e.target.value
                                )
                              }
                              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              كمية الهدايا
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={currentItem.gift_quantity}
                              onChange={(e) =>
                                handleCurrentItemChange(
                                  "gift_quantity",
                                  e.target.value
                                )
                              }
                              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              الإجمالي
                            </label>
                            <div className="w-full p-3 border-2 border-gray-100 rounded-xl bg-gray-50 font-bold text-green-600">
                              €
                              {(
                                parseFloat(currentItem.quantity || 0) *
                                  parseFloat(currentItem.unit_price || 0) -
                                parseFloat(currentItem.discount_amount || 0)
                              ).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={addItemToOrder}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            <Plus className="w-5 h-5 inline-block ml-2" />
                            إضافة المنتج إلى الطلب
                          </motion.button>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Products List */}
                    {formData.items.length > 0 && (
                      <Card className="shadow-xl border-purple-100">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="p-3 bg-purple-100 rounded-xl mr-4">
                                <Package className="w-6 h-6 text-purple-600" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                  منتجات الطلب
                                </h2>
                                <p className="text-gray-600">
                                  ({formData.items.length}) منتج مضاف
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-purple-600">
                                €{parseFloat(totals.subtotal).toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">
                                إجمالي الطلب
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardBody className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                    المنتج
                                  </th>
                                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                    الكمية
                                  </th>
                                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                    سعر الوحدة
                                  </th>
                                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                    الإجمالي
                                  </th>
                                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                    الإجراءات
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {formData.items.map((item, index) => (
                                  <motion.tr
                                    key={item.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="hover:bg-gray-50"
                                  >
                                    <td className="px-6 py-4">
                                      <div className="font-medium text-gray-900">
                                        {item.product_name}
                                      </div>
                                      {parseFloat(item.discount_amount || 0) >
                                        0 && (
                                        <div className="text-sm text-red-600">
                                          خصم: €
                                          {parseFloat(
                                            item.discount_amount
                                          ).toFixed(2)}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {item.quantity}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium">
                                      €
                                      {parseFloat(item.unit_price || 0).toFixed(
                                        2
                                      )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      <span className="text-lg font-bold text-green-600">
                                        €
                                        {parseFloat(
                                          item.total_price || 0
                                        ).toFixed(2)}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </motion.button>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                )}

                {/* Step 3: Review and Notes */}
                {currentStep === 3 && (
                  <Card className="shadow-xl border-yellow-100">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
                      <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-xl mr-4">
                          <FileText className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            المراجعة والملاحظات
                          </h2>
                          <p className="text-gray-600">
                            راجع الطلب وأضف أي ملاحظات إضافية
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="p-6">
                      <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            ملخص الطلب
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                المحل المختار:
                              </p>
                              <p className="font-medium">
                                {stores.find((s) => s.id == formData.store_id)
                                  ?.name || "غير محدد"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                تاريخ الطلب:
                              </p>
                              <p className="font-medium">
                                {formData.order_date}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                عدد المنتجات:
                              </p>
                              <p className="font-medium">
                                {totals.totalItems} منتج
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                إجمالي المبلغ:
                              </p>
                              <p className="text-xl font-bold text-green-600">
                                €{parseFloat(totals.subtotal).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ملاحظات إضافية (اختيارية)
                          </label>
                          <textarea
                            value={formData.notes}
                            onChange={(e) =>
                              handleFormChange("notes", e.target.value)
                            }
                            rows={4}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                            placeholder="أضف أي ملاحظات أو تعليمات خاصة بالطلب..."
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Step 4: Save */}
                {currentStep === 4 && (
                  <Card className="shadow-xl border-green-100">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                      <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-xl mr-4">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            حفظ الطلب
                          </h2>
                          <p className="text-gray-600">
                            الطلب جاهز للحفظ في النظام
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="p-6 text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        <div className="text-6xl">🎉</div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            الطلب جاهز!
                          </h3>
                          <p className="text-gray-600">
                            تم إنشاء طلب يحتوي على {totals.totalItems} منتج
                            بقيمة إجمالية €
                            {parseFloat(totals.subtotal).toFixed(2)}
                          </p>
                        </div>

                        <div className="flex justify-center space-x-4 space-x-reverse">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentStep(3)}
                            className="px-8 py-3"
                          >
                            <Edit3 className="w-4 h-4 ml-2" />
                            مراجعة
                          </Button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                          >
                            {isSaving ? (
                              <div className="flex items-center">
                                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                جاري الحفظ...
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Save className="w-5 h-5 ml-2" />
                                حفظ الطلب
                              </div>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    </CardBody>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between mt-8"
            >
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 1}
                className="px-6 py-3"
              >
                <ChevronLeft className="w-4 h-4 ml-2" />
                السابق
              </Button>

              {currentStep < totalSteps && (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                  className="px-6 py-3"
                >
                  التالي
                  <ChevronRight className="w-4 h-4 mr-2" />
                </Button>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-8"
            >
              <Card className="shadow-xl border-indigo-100">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      ملخص الطلب
                    </h3>
                  </div>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">عدد المنتجات:</span>
                      <span className="font-semibold">{totals.totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">إجمالي الهدايا:</span>
                      <span className="font-semibold">{totals.totalGifts}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">
                          الإجمالي:
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          €{parseFloat(totals.subtotal).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">التقدم</span>
                        <span className="text-sm font-semibold text-indigo-600">
                          {Math.round((currentStep / totalSteps) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(currentStep / totalSteps) * 100}%`,
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        إجراءات سريعة
                      </h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => setCurrentStep(1)}
                          className="w-full text-right px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Store className="w-4 h-4 inline-block ml-2" />
                          تغيير المحل
                        </button>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="w-full text-right px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4 inline-block ml-2" />
                          إضافة منتجات
                        </button>
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="w-full text-right px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4 inline-block ml-2" />
                          مراجعة الطلب
                        </button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Help Card */}
              <Card className="shadow-xl border-gray-100 mt-6">
                <CardBody className="p-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">💡</div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      نصائح مفيدة
                    </h4>
                    <p className="text-sm text-gray-600">
                      يمكنك التنقل بين الخطوات بالنقر على أيقونات التقدم في
                      الأعلى
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Auto-Scheduling Result Modal */}
      {showSchedulingResult && autoSchedulingResult && (
        <AutoSchedulingResultModal
          result={autoSchedulingResult}
          onClose={() => {
            setShowSchedulingResult(false);
            navigate("/orders");
          }}
          onReview={() => {
            setShowSchedulingResult(false);
            navigate("/scheduling/auto-review");
          }}
        />
      )}
    </div>
  );
};

// Auto-Scheduling Result Modal Component
const AutoSchedulingResultModal = ({ result, onClose, onReview }) => {
  const getConfidenceColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    if (score >= 60) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getConfidenceIcon = (score) => {
    if (score >= 90) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (score >= 70) return <TrendingUp className="w-6 h-6 text-blue-600" />;
    return <AlertTriangle className="w-6 h-6 text-orange-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full m-4 overflow-hidden border border-blue-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  🧠 اقتراح الجدولة الذكية
                </h2>
                <p className="text-white text-opacity-80 text-sm">
                  تم تحليل الطلب وإنشاء اقتراح جدولة تلقائي
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Confidence Score */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              {getConfidenceIcon(result.confidence_score)}
            </div>
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-lg ${getConfidenceColor(
                result.confidence_score
              )}`}
            >
              درجة الثقة: {result.confidence_score}%
            </div>
            <p className="text-gray-600 mt-2">
              {result.confidence_score >= 90 && "اقتراح ممتاز - موصى بشدة"}
              {result.confidence_score >= 80 &&
                result.confidence_score < 90 &&
                "اقتراح جيد جداً"}
              {result.confidence_score >= 70 &&
                result.confidence_score < 80 &&
                "اقتراح جيد"}
              {result.confidence_score >= 60 &&
                result.confidence_score < 70 &&
                "اقتراح مقبول - يحتاج مراجعة"}
              {result.confidence_score < 60 &&
                "اقتراح منخفض الثقة - يحتاج مراجعة دقيقة"}
            </p>
          </div>

          {/* Suggestion Details */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserCheck className="w-5 h-5 ml-2" />
              تفاصيل الاقتراح
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">الموزع المقترح</p>
                  <p className="font-semibold text-gray-900">
                    {result.suggested_distributor}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">تاريخ التسليم المقترح</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(
                      result.suggested_delivery_date
                    ).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-4 rtl:space-x-reverse">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              موافق - الانتهاء
            </button>
            <button
              onClick={onReview}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all transform hover:scale-105"
            >
              مراجعة الاقتراح
            </button>
          </div>

          {/* Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>ملاحظة:</strong> هذا اقتراح من النظام الذكي يحتاج
                  موافقة الإدمن قبل التنفيذ. يمكنك مراجعة الاقتراح وتعديله إذا
                  لزم الأمر.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateOrderPage;
