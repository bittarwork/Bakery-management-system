import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  Package,
  Store,
  Plus,
  Edit,
  Save,
  X,
  Check,
  AlertTriangle,
  Star,
  FileText,
  Download,
  Upload,
  Truck,
  User,
  MapPin,
  Euro,
  Gift,
  MessageSquare,
  Eye,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  Coffee,
  CheckCircle,
  AlertCircle,
  Settings,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  Copy,
  Send,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import EnhancedInput from "../ui/EnhancedInput";
import LoadingSpinner from "../ui/LoadingSpinner";
// Import the updated distribution service
import distributionService from "../../services/distributionService";
import storeService from "../../services/storeService";
import productService from "../../services/productService";
import userService from "../../services/userService";

/**
 * Daily Operations Manager Component
 * Handles morning operations: receiving orders, creating schedules, distributor assignments
 */
const DailyOperationsManager = ({ selectedDate, onDateChange }) => {
  // States
  const [currentStep, setCurrentStep] = useState("orderEntry");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Data states
  const [dailyOrders, setDailyOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [distributionSchedules, setDistributionSchedules] = useState([]);

  // Form states
  const [newOrder, setNewOrder] = useState({
    store_id: "",
    items: [],
    notes: "",
    priority: "normal",
  });
  const [currentItem, setCurrentItem] = useState({
    product_id: "",
    quantity: 1,
    gift_quantity: 0,
    notes: "",
  });

  // Filter and search states
  const [filters, setFilters] = useState({
    search: "",
    store: "",
    status: "all",
    priority: "all",
  });

  // Load initial data
  useEffect(() => {
    loadDailyData();
  }, [selectedDate]);

  const loadDailyData = async () => {
    try {
      setIsLoading(true);

      // Use the updated distribution service
      const [
        ordersRes,
        storesRes,
        productsRes,
        distributorsRes,
      ] = await Promise.all([
        distributionService.getDailyOrders(selectedDate),
        storeService.getStores({ status: 'active' }),
        productService.getProducts({ status: 'active', limit: 100 }),
        userService.getUsers({ role: 'distributor', status: 'active' }),
      ]);

      // Process responses
      if (ordersRes.success) {
        setDailyOrders(ordersRes.data || []);
      }

      if (storesRes.success) {
        setStores(storesRes.data?.stores || storesRes.data || []);
      }

      if (productsRes.success) {
        setProducts(productsRes.data?.products || productsRes.data || []);
      }

      if (distributorsRes.success) {
        setDistributors(distributorsRes.data?.users || distributorsRes.data || []);
      }

      // Get smart suggestions from distribution service
      try {
        const suggestionsRes = await distributionService.getDistributionAnalytics('day', {
          date: selectedDate,
          type: 'suggestions'
        });
        if (suggestionsRes.success) {
          setSmartSuggestions(suggestionsRes.data.suggestions || []);
        }
      } catch (error) {
        console.warn("Smart suggestions not available:", error);
        setSmartSuggestions([]);
      }

      // Mock data for development if all API calls failed
      if (!ordersRes.success && !storesRes.success) {
        setMockData();
      }
    } catch (error) {
      console.error("Error loading daily data:", error);
      setMockData(); // Fallback to mock data
      toast.error("خطأ في تحميل البيانات - جاري استخدام بيانات تجريبية");
    } finally {
      setIsLoading(false);
    }
  };

  const setMockData = () => {
    setDailyOrders([
      {
        id: 1,
        store_name: "متجر الصباح",
        store_address: "شارع الجامعة، دمشق",
        total_amount: 85.5,
        items_count: 5,
        status: "pending",
        priority: "normal",
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        store_name: "مخبز النور",
        store_address: "حي المزة، دمشق",
        total_amount: 120.75,
        items_count: 8,
        status: "confirmed",
        priority: "high",
        created_at: new Date().toISOString(),
      },
    ]);

    setStores([
      {
        id: 1,
        name: "متجر الصباح",
        address: "شارع الجامعة، دمشق",
        phone: "011-123456",
      },
      {
        id: 2,
        name: "مخبز النور",
        address: "حي المزة، دمشق",
        phone: "011-789012",
      },
      {
        id: 3,
        name: "سوبر ماركت الحياة",
        address: "حي المالكي، دمشق",
        phone: "011-345678",
      },
    ]);

    setProducts([
      { id: 1, name: "خبز أبيض", price_eur: 1.5, unit: "كيس" },
      { id: 2, name: "خبز أسمر", price_eur: 1.75, unit: "كيس" },
      { id: 3, name: "كعك السمسم", price_eur: 2.25, unit: "صينية" },
    ]);

    setDistributors([
      { id: 1, name: "أحمد محمد", phone: "0944-123456", vehicle: "فان صغير" },
      {
        id: 2,
        name: "خالد السوري",
        phone: "0933-789012",
        vehicle: "شاحنة متوسطة",
      },
    ]);

    setSmartSuggestions([
      {
        type: "missing_orders",
        title: "محلات لم تطلب اليوم",
        description: "3 محلات لديها نمط طلب يومي لم تضع طلبات اليوم",
        stores: ["سوبر ماركت الحياة", "متجر الوردة", "مخبز الشام"],
        action: "suggest_quantities",
      },
      {
        type: "unusual_quantities",
        title: "كميات غير اعتيادية",
        description: "متجر الصباح طلب كمية أكبر من المعتاد بـ50%",
        stores: ["متجر الصباح"],
        action: "verify_order",
      },
    ]);
  };

  // Order management functions
  const addItemToOrder = () => {
    if (!currentItem.product_id || currentItem.quantity <= 0) {
      toast.error("يرجى اختيار منتج وإدخال كمية صحيحة");
      return;
    }

    const product = products.find(
      (p) => p.id === parseInt(currentItem.product_id)
    );
    if (!product) {
      toast.error("المنتج المحدد غير موجود");
      return;
    }

    const item = {
      id: Date.now(),
      product_id: parseInt(currentItem.product_id),
      product_name: product.name,
      product_unit: product.unit,
      quantity: parseInt(currentItem.quantity),
      gift_quantity: parseInt(currentItem.gift_quantity || 0),
      unit_price: parseFloat(product.price_eur),
      total_price:
        parseFloat(product.price_eur) * parseInt(currentItem.quantity),
      notes: currentItem.notes,
    };

    setNewOrder((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));

    // Reset current item
    setCurrentItem({
      product_id: "",
      quantity: 1,
      gift_quantity: 0,
      notes: "",
    });

    toast.success("تم إضافة المنتج إلى الطلب");
  };

  const removeItemFromOrder = (itemId) => {
    setNewOrder((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
    toast.success("تم حذف المنتج من الطلب");
  };

  const saveOrder = async () => {
    if (!newOrder.store_id) {
      toast.error("يرجى اختيار المتجر");
      return;
    }

    if (newOrder.items.length === 0) {
      toast.error("يرجى إضافة منتج واحد على الأقل");
      return;
    }

    try {
      setIsSaving(true);

      const orderData = {
        store_id: parseInt(newOrder.store_id),
        scheduled_delivery_date: selectedDate,
        priority: newOrder.priority,
        notes: newOrder.notes,
        items: newOrder.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          gift_quantity: item.gift_quantity || 0,
          notes: item.notes,
        })),
      };

      const response = await distributionService.addManualOrder(orderData);

      if (response.success) {
        const result = response.data;

        // Add the new order to the list
        const store = stores.find((s) => s.id === parseInt(newOrder.store_id));
        const newOrderData = {
          id: result?.id || Date.now(),
          store_name: store?.name || "متجر غير معروف",
          store_address: store?.address || "",
          total_amount: newOrder.items.reduce(
            (sum, item) => sum + item.total_price,
            0
          ),
          items_count: newOrder.items.length,
          status: "pending",
          priority: newOrder.priority,
          created_at: new Date().toISOString(),
        };

        setDailyOrders((prev) => [newOrderData, ...prev]);

        // Reset form
        setNewOrder({
          store_id: "",
          items: [],
          notes: "",
          priority: "normal",
        });

        toast.success("تم حفظ الطلب بنجاح");
      } else {
        toast.error(response.message || "خطأ في حفظ الطلب");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setIsSaving(false);
    }
  };

  const generateDistributionSchedules = async () => {
    try {
      setIsLoading(true);

      const response = await distributionService.generateSchedules(selectedDate, []);

      if (response.success) {
        const result = response.data;
        setDistributionSchedules(result || []);
        setCurrentStep("scheduleReview");
        toast.success("تم إنشاء جداول التوزيع بنجاح");
      } else {
        toast.error(response.message || "خطأ في إنشاء الجداول");
      }
    } catch (error) {
      console.error("Error generating schedules:", error);
      toast.error("خطأ في إنشاء جداول التوزيع");

      // Mock schedules for development
      setDistributionSchedules([
        {
          id: 1,
          distributor_id: 1,
          distributor_name: "أحمد محمد",
          total_orders: 8,
          total_amount: 485.5,
          estimated_duration: 4.5,
          route_optimization: "optimized",
          orders: dailyOrders.slice(0, 4),
        },
        {
          id: 2,
          distributor_id: 2,
          distributor_name: "خالد السوري",
          total_orders: 6,
          total_amount: 320.75,
          estimated_duration: 3.2,
          route_optimization: "optimized",
          orders: dailyOrders.slice(4),
        },
      ]);
      setCurrentStep("scheduleReview");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = dailyOrders.filter((order) => {
    const matchesSearch =
      !filters.search ||
      order.store_name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStore =
      !filters.store || order.store_id === parseInt(filters.store);
    const matchesStatus =
      filters.status === "all" || order.status === filters.status;
    const matchesPriority =
      filters.priority === "all" || order.priority === filters.priority;

    return matchesSearch && matchesStore && matchesStatus && matchesPriority;
  });

  // Step components
  const OrderEntryStep = () => (
    <div className="space-y-6">
      {/* Daily Orders List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Package className="w-5 h-5 text-blue-600 ml-2" />
              طلبات اليوم ({filteredOrders.length})
            </h3>
            <div className="flex items-center gap-3">
              <EnhancedInput
                type="text"
                placeholder="البحث في الطلبات..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                icon={<Search className="w-4 h-4" />}
                size="sm"
                className="w-48"
              />
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">معلق</option>
                <option value="confirmed">مؤكد</option>
                <option value="in_progress">قيد التنفيذ</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {filteredOrders.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  لا توجد طلبات
                </h3>
                <p className="text-gray-600">
                  ابدأ بإضافة الطلبات الواردة من WhatsApp
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Star className="w-5 h-5 text-yellow-600 ml-2" />
              اقتراحات ذكية
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartSuggestions.map((suggestion, index) => (
                <SuggestionCard key={index} suggestion={suggestion} />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Add New Order */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Plus className="w-5 h-5 text-green-600 ml-2" />
            إضافة طلب جديد
          </h3>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  اختر المتجر <span className="text-red-500">*</span>
                </label>
                <select
                  value={newOrder.store_id}
                  onChange={(e) =>
                    setNewOrder((prev) => ({
                      ...prev,
                      store_id: e.target.value,
                    }))
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- اختر المتجر --</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name} - {store.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  أولوية الطلب
                </label>
                <select
                  value={newOrder.priority}
                  onChange={(e) =>
                    setNewOrder((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="low">منخفض</option>
                  <option value="normal">عادي</option>
                  <option value="high">عالي</option>
                  <option value="urgent">عاجل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ملاحظات الطلب
                </label>
                <textarea
                  value={newOrder.notes}
                  onChange={(e) =>
                    setNewOrder((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="أي ملاحظات خاصة بالطلب..."
                />
              </div>
            </div>

            {/* Add Items */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900">
                إضافة المنتجات
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المنتج
                  </label>
                  <select
                    value={currentItem.product_id}
                    onChange={(e) =>
                      setCurrentItem((prev) => ({
                        ...prev,
                        product_id: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- اختر المنتج --</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - €
                        {parseFloat(product.price_eur).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الكمية
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) =>
                      setCurrentItem((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    هدايا
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentItem.gift_quantity}
                    onChange={(e) =>
                      setCurrentItem((prev) => ({
                        ...prev,
                        gift_quantity: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات المنتج
                  </label>
                  <input
                    type="text"
                    value={currentItem.notes}
                    onChange={(e) =>
                      setCurrentItem((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="ملاحظات اختيارية..."
                  />
                </div>
              </div>

              <EnhancedButton
                onClick={addItemToOrder}
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                className="w-full"
              >
                إضافة إلى الطلب
              </EnhancedButton>

              {/* Order Items List */}
              {newOrder.items.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    منتجات الطلب:
                  </h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {newOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.product_name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.quantity} {item.product_unit}
                            {item.gift_quantity > 0 &&
                              ` + ${item.gift_quantity} هدية`}
                            - €{parseFloat(item.total_price).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItemFromOrder(item.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>إجمالي الطلب:</span>
                      <span>
                        €
                        {newOrder.items
                          .reduce((sum, item) => sum + item.total_price, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <EnhancedButton
                  onClick={saveOrder}
                  variant="success"
                  icon={<Save className="w-4 h-4" />}
                  className="flex-1"
                  isLoading={isSaving}
                  disabled={!newOrder.store_id || newOrder.items.length === 0}
                >
                  حفظ الطلب
                </EnhancedButton>
                <EnhancedButton
                  onClick={() => {
                    setNewOrder({
                      store_id: "",
                      items: [],
                      notes: "",
                      priority: "normal",
                    });
                    setCurrentItem({
                      product_id: "",
                      quantity: 1,
                      gift_quantity: 0,
                      notes: "",
                    });
                  }}
                  variant="secondary"
                  icon={<X className="w-4 h-4" />}
                >
                  إلغاء
                </EnhancedButton>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <EnhancedButton
          onClick={generateDistributionSchedules}
          variant="primary"
          icon={<Zap className="w-4 h-4" />}
          size="lg"
          disabled={dailyOrders.length === 0}
          isLoading={isLoading}
        >
          توليد جداول التوزيع
        </EnhancedButton>
      </div>
    </div>
  );

  // Helper components
  const OrderCard = ({ order }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h5 className="font-semibold text-gray-900 text-sm">
            {order.store_name}
          </h5>
          <p className="text-xs text-gray-600 mt-1">{order.store_address}</p>
        </div>
        <div className="text-right">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">المنتجات:</span>
          <span className="font-medium">{order.items_count}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">المبلغ:</span>
          <span className="font-semibold text-green-600">
            €{parseFloat(order.total_amount).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">الأولوية:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
              order.priority
            )}`}
          >
            {getPriorityText(order.priority)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <EnhancedButton size="sm" variant="primary" className="flex-1">
          <Eye className="w-3 h-3 ml-1" />
          عرض
        </EnhancedButton>
        <EnhancedButton size="sm" variant="secondary" className="flex-1">
          <Edit className="w-3 h-3 ml-1" />
          تعديل
        </EnhancedButton>
      </div>
    </motion.div>
  );

  const SuggestionCard = ({ suggestion }) => (
    <div
      className={`rounded-lg p-4 border-l-4 ${
        suggestion.type === "missing_orders"
          ? "bg-yellow-50 border-yellow-400"
          : "bg-blue-50 border-blue-400"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-semibold text-gray-900 text-sm">
          {suggestion.title}
        </h5>
        <AlertTriangle
          className={`w-4 h-4 ${
            suggestion.type === "missing_orders"
              ? "text-yellow-600"
              : "text-blue-600"
          }`}
        />
      </div>
      <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
      <div className="space-y-2">
        {suggestion.stores.map((store, index) => (
          <div
            key={index}
            className="text-xs bg-white px-2 py-1 rounded border"
          >
            {store}
          </div>
        ))}
      </div>
      <EnhancedButton
        size="sm"
        variant={suggestion.type === "missing_orders" ? "warning" : "primary"}
        className="mt-3 w-full"
      >
        {suggestion.action === "suggest_quantities"
          ? "اقتراح كميات"
          : "التحقق من الطلب"}
      </EnhancedButton>
    </div>
  );

  // Helper functions (same as before)
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "معلق",
      confirmed: "مؤكد",
      in_progress: "قيد التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return texts[status] || "غير معروف";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.normal;
  };

  const getPriorityText = (priority) => {
    const texts = {
      low: "منخفض",
      normal: "عادي",
      high: "عالي",
      urgent: "عاجل",
    };
    return texts[priority] || "عادي";
  };

  if (isLoading && currentStep === "orderEntry") {
    return (
      <LoadingSpinner text="جاري تحميل بيانات العمليات اليومية..." size="lg" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="bg-white rounded-xl border-0 shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl ml-4">
              <Coffee className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                العمليات اليومية -{" "}
                {new Date(selectedDate).toLocaleDateString("ar-SA")}
              </h2>
              <p className="text-gray-600">
                استلام الطلبات وإنشاء جداول التوزيع
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <EnhancedButton
              onClick={loadDailyData}
              variant="secondary"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              تحديث
            </EnhancedButton>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <OrderEntryStep />
    </div>
  );
};

export default DailyOperationsManager;
