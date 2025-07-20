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
} from "lucide-react";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import orderService from "../../services/orderService";
import productService from "../../services/productService";
import storeService from "../../services/storeService";
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
      await Promise.all([loadOrder(), loadStores(), loadProducts()]);
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
      if (response.success) {
        const order = response.data;
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
          items:
            order.items?.map((item, index) => ({
              id: item.id || `temp-${index}`,
              product_id: item.product_id,
              product_name: item.product_name || "منتج غير محدد",
              quantity: item.quantity || 1,
              unit_price: item.unit_price || 0,
              discount_amount: item.discount_amount || 0,
              gift_quantity: item.gift_quantity || 0,
              gift_reason: item.gift_reason || "",
              notes: item.notes || "",
              total_price:
                item.quantity * item.unit_price - (item.discount_amount || 0),
            })) || [],
        });
      } else {
        toast.error(response.message || "الطلب غير موجود");
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("خطأ في تحميل بيانات الطلب");
      navigate("/orders");
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCurrentItemChange = (field, value) => {
    setCurrentItem((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-fill unit price when product is selected
      if (field === "product_id" && value) {
        const selectedProduct = products.find((p) => p.id === parseInt(value));
        if (selectedProduct) {
          updated.unit_price = selectedProduct.price_eur || 0;
        }
      }

      return updated;
    });
  };

  // Add item to order
  const addItemToOrder = () => {
    if (!currentItem.product_id || currentItem.quantity <= 0) {
      toast.error("يرجى اختيار منتج وكمية صحيحة");
      return;
    }

    const selectedProduct = products.find(
      (p) => p.id === parseInt(currentItem.product_id)
    );
    if (!selectedProduct) {
      toast.error("المنتج غير موجود");
      return;
    }

    const newItem = {
      ...currentItem,
      id: `temp-${Date.now()}`, // temporary ID for new items
      product_name: selectedProduct.name,
      total_price:
        currentItem.quantity * currentItem.unit_price -
        currentItem.discount_amount,
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

  // Remove item from order
  const removeItemFromOrder = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    toast.success("تم حذف المنتج من الطلب");
  };

  // Update existing item
  const updateItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(index);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: newQuantity,
              total_price:
                newQuantity * item.unit_price - (item.discount_amount || 0),
            }
          : item
      ),
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (item.total_price || 0),
      0
    );
    const totalGifts = formData.items.reduce(
      (sum, item) => sum + (item.gift_quantity || 0),
      0
    );

    return {
      subtotal,
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

      if (response.success) {
        toast.success("تم تحديث الطلب بنجاح");
        navigate(`/orders/${orderId}`);
      } else {
        toast.error(response.message || "خطأ في تحديث الطلب");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("خطأ في تحديث الطلب");
    } finally {
      setIsSaving(false);
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
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    تعديل الطلب
                  </h1>
                  <p className="text-gray-600 mt-1">تعديل تفاصيل الطلب</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/orders/${orderId}`)}
                  disabled={isSaving}
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
                        {stores.map((store) => (
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
                      منتجات متاحة: {products.length}
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
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} - €
                            {(product.price_eur || 0).toFixed(2)}
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
                          {(
                            currentItem.quantity * currentItem.unit_price -
                            currentItem.discount_amount
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
                        €{totals.subtotal.toFixed(2)}
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
