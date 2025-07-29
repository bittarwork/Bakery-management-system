import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Package,
  Store,
  Calendar,
  Euro,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Building,
  Globe,
  Calculator,
  Clock,
  User,
  Truck,
  XCircle,
} from "lucide-react";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import orderService from "../../services/orderService";
import productService from "../../services/productService";
import storeService from "../../services/storeService";
import userService from "../../services/userService";
import { toast } from "react-hot-toast";

const EditOrderPage = () => {
  const navigate = useNavigate();
  const { id: orderId } = useParams();

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [distributors, setDistributors] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    store_id: "",
    order_date: "",
    delivery_date: "",
    notes: "",
    currency: "EUR",
    exchange_rate: 15000,
    status: "draft",
    payment_status: "pending",
    assigned_distributor_id: null,
    items: [],
  });

  // Current item being added
  const [currentItem, setCurrentItem] = useState({
    product_id: "",
    quantity: 1,
    unit_price: 0,
    discount_amount: 0,
    gift_quantity: 0,
    gift_reason: "",
    notes: "",
  });

  // Load initial data
  useEffect(() => {
    if (orderId) {
      loadInitialData();
    }
  }, [orderId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadOrder(),
        loadStores(),
        loadProducts(),
        loadDistributors(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("خطأ في تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrder = async () => {
    try {
      const response = await orderService.getOrder(orderId);
      if (response && response.success !== false) {
        const order = response.data || response;
        setFormData({
          store_id: order.store_id || "",
          order_date: order.order_date ? order.order_date.split("T")[0] : "",
          delivery_date: order.delivery_date
            ? order.delivery_date.split("T")[0]
            : "",
          notes: order.notes || "",
          currency: "EUR", // Fixed to EUR only
          status: order.status || "draft",
          payment_status: order.payment_status || "pending",
          assigned_distributor_id: order.assigned_distributor_id || null,
          items:
            order.items?.map((item) => ({
              id: item.id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price_eur || 0,
              discount_amount: 0,
              gift_quantity: 0,
              gift_reason: "",
              notes: item.notes || "",
            })) || [],
        });
      }
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("خطأ في تحميل بيانات الطلب");
    }
  };

  const loadStores = async () => {
    try {
      const response = await storeService.getStores();
      if (response && response.success !== false) {
        const storesData = response.data || response;
        console.log("Loaded stores:", storesData);
        // Handle different response structures
        const storesArray = Array.isArray(storesData)
          ? storesData
          : storesData.stores || storesData.data || [];
        setStores(storesArray);
      } else {
        console.warn("Failed to load stores, using empty array");
        setStores([]);
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      toast.error("خطأ في تحميل المتاجر");
      setStores([]);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts();
      if (response && response.success !== false) {
        const productsData = response.data || response;
        console.log("Loaded products:", productsData);
        // Handle different response structures
        const productsArray = Array.isArray(productsData)
          ? productsData
          : productsData.products || productsData.data || [];
        setProducts(productsArray);
      } else {
        console.warn("Failed to load products, using empty array");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("خطأ في تحميل المنتجات");
      setProducts([]);
    }
  };

  const loadDistributors = async () => {
    try {
      const response = await userService.getUsers({ role: "distributor" });
      if (response && response.success !== false) {
        const distributorsData = response.data || response;
        console.log("Loaded distributors:", distributorsData);
        // Handle different response structures
        const distributorsArray = Array.isArray(distributorsData)
          ? distributorsData
          : distributorsData.users || distributorsData.data || [];
        setDistributors(distributorsArray);
      } else {
        console.warn("Failed to load distributors, using empty array");
        setDistributors([]);
      }
    } catch (error) {
      console.error("Error loading distributors:", error);
      toast.error("خطأ في تحميل الموزعين");
      setDistributors([]);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrentItemChange = (field, value) => {
    setCurrentItem((prev) => ({ ...prev, [field]: value }));

    // Auto-calculate unit price when product is selected
    if (field === "product_id" && value) {
      const selectedProduct = products.find((p) => p.id === parseInt(value));
      if (selectedProduct) {
        setCurrentItem((prev) => ({
          ...prev,
          unit_price: parseFloat(selectedProduct.price_eur || 0),
        }));
      }
    }
  };

  const addItemToOrder = () => {
    if (!currentItem.product_id) {
      toast.error("يرجى اختيار منتج");
      return;
    }

    if (currentItem.quantity <= 0) {
      toast.error("يجب أن تكون الكمية أكبر من صفر");
      return;
    }

    const selectedProduct = products.find(
      (p) => p.id === parseInt(currentItem.product_id)
    );

    if (!selectedProduct) {
      toast.error("المنتج المحدد غير موجود");
      return;
    }

    const newItem = {
      id: `temp-${Date.now()}`,
      product_id: currentItem.product_id,
      quantity: parseInt(currentItem.quantity),
      unit_price: parseFloat(currentItem.unit_price),
      discount_amount: parseFloat(currentItem.discount_amount || 0),
      gift_quantity: parseInt(currentItem.gift_quantity || 0),
      gift_reason: currentItem.gift_reason,
      notes: currentItem.notes,
      product_name: selectedProduct.name,
      product_unit: selectedProduct.unit,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset current item
    setCurrentItem({
      product_id: "",
      quantity: 1,
      unit_price: 0,
      discount_amount: 0,
      gift_quantity: 0,
      gift_reason: "",
      notes: "",
    });

    toast.success("تم إضافة المنتج إلى الطلب");
  };

  const removeItemFromOrder = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    toast.success("تم إزالة المنتج من الطلب");
  };

  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      toast.error("يجب أن تكون الكمية أكبر من صفر");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, quantity: parseInt(newQuantity) } : item
      ),
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const totalDiscounts = formData.items.reduce(
      (sum, item) => sum + (item.discount_amount || 0),
      0
    );
    const totalGifts = formData.items.reduce(
      (sum, item) => sum + (item.gift_quantity || 0),
      0
    );

    return {
      subtotal,
      totalDiscounts,
      total: subtotal - totalDiscounts,
      totalGifts,
      totalItems: formData.items.length,
    };
  };

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.store_id) {
      toast.error("يرجى اختيار المتجر");
      return;
    }

    if (formData.items.length === 0) {
      toast.error("يرجى إضافة منتج واحد على الأقل");
      return;
    }

    try {
      setIsSaving(true);

      console.log("Submitting order update with data:", {
        status: formData.status,
        payment_status: formData.payment_status,
        assigned_distributor_id: formData.assigned_distributor_id,
      });

      // Prepare order data
      const orderData = {
        store_id: parseInt(formData.store_id),
        order_date: formData.order_date,
        delivery_date: formData.delivery_date || null,
        notes: formData.notes,
        currency: formData.currency,
        exchange_rate: formData.exchange_rate,
        status: formData.status,
        payment_status: formData.payment_status,
        assigned_distributor_id: formData.assigned_distributor_id
          ? parseInt(formData.assigned_distributor_id)
          : null,
        items: formData.items.map((item) => ({
          id:
            typeof item.id === "string" && item.id.startsWith("temp-")
              ? undefined
              : item.id,
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price),
          discount_amount: parseFloat(item.discount_amount || 0),
          gift_quantity: parseInt(item.gift_quantity || 0),
          gift_reason: item.gift_reason || null,
          notes: item.notes || null,
        })),
      };

      const response = await orderService.updateOrder(orderId, orderData);

      if (response && response.success !== false) {
        toast.success("تم تحديث الطلب بنجاح");
        navigate(`/orders/${orderId}`);
      } else {
        const errorMessage = response?.message || "خطأ في تحديث الطلب";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      let errorMessage = "خطأ في تحديث الطلب";

      if (error.response?.status === 400) {
        errorMessage =
          "بيانات الطلب غير صحيحة - يرجى التحقق من المعلومات المدخلة";
      } else if (error.response?.status === 403) {
        errorMessage = "غير مصرح لك بتعديل هذا الطلب";
      } else if (error.response?.status === 404) {
        errorMessage = "الطلب غير موجود";
      } else if (error.response?.status >= 500) {
        errorMessage = "خطأ في الخادم - يرجى المحاولة مرة أخرى لاحقاً";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle distributor assignment
  const handleAssignDistributor = async (distributorId) => {
    try {
      console.log("Assigning distributor:", distributorId);
      const response = await orderService.assignDistributor(
        orderId,
        distributorId
      );
      if (response && response.success !== false) {
        toast.success("تم تعيين الموزع بنجاح");
        setFormData((prev) => ({
          ...prev,
          assigned_distributor_id: distributorId,
        }));
        // Reload order to get updated data
        await loadOrder();
      } else {
        toast.error(response?.message || "خطأ في تعيين الموزع");
      }
    } catch (error) {
      console.error("Error assigning distributor:", error);
      toast.error("خطأ في تعيين الموزع");
    }
  };

  // Handle distributor unassignment
  const handleUnassignDistributor = async () => {
    try {
      console.log("Unassigning distributor from order:", orderId);
      const response = await orderService.unassignDistributor(orderId);
      if (response && response.success !== false) {
        toast.success("تم إلغاء تعيين الموزع بنجاح");
        setFormData((prev) => ({ ...prev, assigned_distributor_id: null }));
        // Reload order to get updated data
        await loadOrder();
      } else {
        toast.error(response?.message || "خطأ في إلغاء تعيين الموزع");
      }
    } catch (error) {
      console.error("Error unassigning distributor:", error);
      toast.error("خطأ في إلغاء تعيين الموزع");
    }
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen text="جاري تحميل بيانات الطلب..." size="lg" />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(`/orders/${orderId}`)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  العودة إلى تفاصيل الطلب
                </button>
                <div className="h-6 w-px bg-gray-300" />
                <h1 className="text-2xl font-bold text-gray-900">
                  تعديل الطلب #{orderId}
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/orders/${orderId}`)}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSaving || formData.items.length === 0}
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الحفظ...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      حفظ التغييرات
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow rounded-lg"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    معلومات أساسية
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        المتجر <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.store_id}
                        onChange={(e) =>
                          handleFormChange("store_id", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">اختر المتجر</option>
                        {Array.isArray(stores) &&
                          stores.map((store) => (
                            <option key={store.id} value={store.id}>
                              {store.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ الطلب
                      </label>
                      <input
                        type="date"
                        value={formData.order_date}
                        onChange={(e) =>
                          handleFormChange("order_date", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ التسليم
                      </label>
                      <input
                        type="date"
                        value={formData.delivery_date}
                        onChange={(e) =>
                          handleFormChange("delivery_date", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        حالة الطلب
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          handleFormChange("status", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="draft">مسودة</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="in_progress">قيد التحضير</option>
                        <option value="delivered">مُسلم</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        الحالة الحالية: {formData.status}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        حالة الدفع
                      </label>
                      <select
                        value={formData.payment_status}
                        onChange={(e) =>
                          handleFormChange("payment_status", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="pending">معلق</option>
                        <option value="paid">مدفوع</option>
                        <option value="partial">جزئي</option>
                        <option value="failed">فاشل</option>
                        <option value="overdue">متأخر</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        حالة الدفع الحالية: {formData.payment_status}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ملاحظات
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          handleFormChange("notes", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="أدخل أي ملاحظات إضافية..."
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Distributor Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white shadow rounded-lg"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-purple-600" />
                    إدارة الموزع
                  </h2>
                </div>
                <div className="p-6">
                  {formData.assigned_distributor_id ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <h3 className="font-medium text-green-900">
                              موزع مُعيّن
                            </h3>
                            <p className="text-sm text-green-700">
                              {(Array.isArray(distributors) &&
                                distributors.find(
                                  (d) =>
                                    d.id === formData.assigned_distributor_id
                                )?.full_name) ||
                                "غير محدد"}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              معرف الموزع:{" "}
                              {formData.assigned_distributor_id || "غير محدد"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleUnassignDistributor}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          إلغاء التعيين
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <XCircle className="w-5 h-5 text-gray-500" />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              لا يوجد موزع مُعيّن
                            </h3>
                            <p className="text-sm text-gray-600">
                              يمكنك تعيين موزع للطلب من القائمة أدناه
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          اختر موزع
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Array.isArray(distributors) &&
                            distributors.map((distributor) => (
                              <button
                                key={distributor.id}
                                onClick={() =>
                                  handleAssignDistributor(distributor.id)
                                }
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <User className="w-4 h-4 text-gray-500" />
                                  <div className="text-left">
                                    <p className="font-medium text-gray-900">
                                      {distributor.full_name}
                                    </p>
                                    {distributor.phone && (
                                      <p className="text-sm text-gray-600">
                                        {distributor.phone}
                                      </p>
                                    )}
                                    {distributor.email && (
                                      <p className="text-xs text-gray-500">
                                        {distributor.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Truck className="w-4 h-4 text-gray-400" />
                              </button>
                            ))}
                        </div>
                        {(!Array.isArray(distributors) ||
                          distributors.length === 0) && (
                          <div className="text-center py-8">
                            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-sm text-gray-500 mb-2">
                              لا يوجد موزعين متاحين
                            </p>
                            <p className="text-xs text-gray-400">
                              يجب إنشاء موزعين في النظام أولاً
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Add Items - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white shadow rounded-lg"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      إضافة منتجات جديدة
                    </h2>
                    <div className="text-sm text-gray-500">
                      منتجات متاحة:{" "}
                      {Array.isArray(products) ? products.length : 0}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <Package className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-900 mb-1">
                          إضافة منتجات إلى الطلب
                        </h3>
                        <p className="text-xs text-blue-700">
                          يمكنك إضافة منتجات جديدة أو تعديل الكميات الموجودة.
                          سيتم حساب الأسعار تلقائياً.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اختر المنتج <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={currentItem.product_id}
                        onChange={(e) =>
                          handleCurrentItemChange("product_id", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">-- اختر المنتج --</option>
                        {Array.isArray(products) &&
                          products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - €
                              {parseFloat(product.price_eur || 0).toFixed(2)}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الكمية <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={currentItem.quantity}
                          onChange={(e) =>
                            handleCurrentItemChange(
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                          placeholder="أدخل الكمية"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          سعر الوحدة (€)
                        </label>
                        <input
                          type="number"
                          value={currentItem.unit_price}
                          onChange={(e) =>
                            handleCurrentItemChange(
                              "unit_price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                          placeholder="السعر (يتم ملؤه تلقائياً)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="border-t pt-4 mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      خيارات إضافية (اختيارية)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          مبلغ الخصم (€)
                        </label>
                        <input
                          type="number"
                          value={currentItem.discount_amount}
                          onChange={(e) =>
                            handleCurrentItemChange(
                              "discount_amount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          كمية الهدية
                        </label>
                        <input
                          type="number"
                          value={currentItem.gift_quantity}
                          onChange={(e) =>
                            handleCurrentItemChange(
                              "gift_quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          min="0"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          سبب الهدية
                        </label>
                        <input
                          type="text"
                          value={currentItem.gift_reason}
                          onChange={(e) =>
                            handleCurrentItemChange(
                              "gift_reason",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="مثال: عرض ترويجي"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      onClick={addItemToOrder}
                      disabled={
                        !currentItem.product_id || currentItem.quantity <= 0
                      }
                      className="flex-1 sm:flex-none"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة إلى الطلب
                    </Button>

                    {(currentItem.product_id ||
                      currentItem.quantity > 1 ||
                      currentItem.unit_price > 0) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setCurrentItem({
                            product_id: "",
                            quantity: 1,
                            unit_price: 0,
                            discount_amount: 0,
                            gift_quantity: 0,
                            gift_reason: "",
                            notes: "",
                          })
                        }
                        className="flex-1 sm:flex-none"
                      >
                        إعادة تعيين
                      </Button>
                    )}
                  </div>

                  {/* Preview */}
                  {currentItem.product_id &&
                    currentItem.quantity > 0 &&
                    currentItem.unit_price > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          معاينة المنتج:
                        </div>
                        <div className="font-medium">
                          {
                            products.find(
                              (p) => p.id === parseInt(currentItem.product_id)
                            )?.name
                          }{" "}
                          × {currentItem.quantity}
                        </div>
                        <div className="text-sm text-gray-600">
                          الإجمالي: €
                          {parseFloat(
                            parseFloat(currentItem.quantity || 0) *
                              parseFloat(currentItem.unit_price || 0) -
                              parseFloat(currentItem.discount_amount || 0)
                          ).toFixed(2)}
                          {currentItem.gift_quantity > 0 && (
                            <span className="text-green-600">
                              {" "}
                              + {currentItem.gift_quantity} هدية
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </motion.div>

              {/* Order Items List */}
              {formData.items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white shadow rounded-lg"
                >
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      منتجات الطلب ({formData.items.length})
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                            المنتج
                          </th>
                          <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                            الكمية
                          </th>
                          <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                            السعر
                          </th>
                          <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                            المجموع
                          </th>
                          <th className="text-center py-3 px-6 text-xs font-medium text-gray-500 uppercase">
                            إجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.items.map((item, index) => (
                          <tr
                            key={item.id || index}
                            className="hover:bg-gray-50"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <Package className="w-5 h-5 text-gray-400 mr-2" />
                                <span className="font-medium">
                                  {item.product_name}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateItemQuantity(index, item.quantity - 1)
                                  }
                                  className="w-8 h-8 p-0"
                                >
                                  -
                                </Button>
                                <span className="w-12 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateItemQuantity(index, item.quantity + 1)
                                  }
                                  className="w-8 h-8 p-0"
                                >
                                  +
                                </Button>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              €{(parseFloat(item.unit_price) || 0).toFixed(2)}
                            </td>
                            <td className="py-4 px-6 text-center font-bold text-green-600">
                              €{(parseFloat(item.total_price) || 0).toFixed(2)}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItemFromOrder(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white shadow rounded-lg"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    ملخص الطلب
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">عدد المنتجات:</span>
                    <span className="font-medium">{totals.totalItems}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">إجمالي الهدايا:</span>
                    <span className="font-medium text-green-600">
                      {totals.totalGifts}
                    </span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        المجموع النهائي:
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        €{parseFloat(totals.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Order Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white shadow rounded-lg"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    حالة الطلب
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">حالة الطلب:</span>
                    <span className="font-medium">
                      {formData.status === "draft"
                        ? "مسودة"
                        : formData.status === "confirmed"
                        ? "مؤكد"
                        : formData.status === "in_progress"
                        ? "قيد التحضير"
                        : formData.status === "delivered"
                        ? "مُسلم"
                        : formData.status === "cancelled"
                        ? "ملغي"
                        : formData.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">حالة الدفع:</span>
                    <span className="font-medium">
                      {formData.payment_status === "pending"
                        ? "معلق"
                        : formData.payment_status === "paid"
                        ? "مدفوع"
                        : formData.payment_status === "partial"
                        ? "جزئي"
                        : formData.payment_status === "failed"
                        ? "فاشل"
                        : formData.payment_status === "overdue"
                        ? "متأخر"
                        : formData.payment_status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">العملة:</span>
                    <span className="font-medium">يورو (EUR)</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderPage;
