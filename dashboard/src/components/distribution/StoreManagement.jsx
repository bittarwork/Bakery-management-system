import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Store,
  Search,
  Filter,
  MapPin,
  Phone,
  Euro,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Upload,
  User,
  Package,
  CreditCard,
  AlertCircle,
  Star,
  ShoppingCart,
  Target,
  Activity,
  Zap,
  FileText,
  Settings,
  History,
  DollarSign,
  Percent,
  Award,
  Coffee,
  Mail,
  MessageSquare,
  Navigation,
  Map,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Info,
  XCircle
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import EnhancedInput from "../ui/EnhancedInput";
import LoadingSpinner from "../ui/LoadingSpinner";

/**
 * Store Management Component
 * Comprehensive store analysis and management for distribution
 */
const StoreManagement = ({ selectedDate }) => {
  // States
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // grid, list, analytics

  // Filter and search states
  const [filters, setFilters] = useState({
    search: "",
    area: "all",
    payment_status: "all",
    order_frequency: "all",
    performance: "all"
  });

  // Analytics states
  const [analytics, setAnalytics] = useState({
    totalStores: 0,
    activeStores: 0,
    averageOrderValue: 0,
    topPerformers: [],
    paymentAnalysis: {}
  });

  // Load stores data
  useEffect(() => {
    loadStoresData();
  }, [selectedDate, filters]);

  const loadStoresData = async () => {
    try {
      setIsLoading(true);

      // Safe JSON parsing function
      const parseJsonSafely = async (response) => {
        if (!response.ok) {
          console.warn("API response not OK:", response.status);
          return { data: [] };
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        } else {
          console.warn("Non-JSON response received:", await response.text());
          return { data: [] };
        }
      };

      const queryParams = new URLSearchParams({
        date: selectedDate,
        search: filters.search,
        area: filters.area,
        payment_status: filters.payment_status,
        order_frequency: filters.order_frequency
      });

      const [storesRes, analyticsRes] = await Promise.all([
        fetch(`/api/distribution/stores?${queryParams}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        }),
        fetch(`/api/distribution/stores/analytics?${queryParams}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        })
      ]);

      const storesData = await parseJsonSafely(storesRes);
      const analyticsData = await parseJsonSafely(analyticsRes);
      
      if (storesData.data && storesData.data.length > 0) {
        setStores(storesData.data);
        setAnalytics(analyticsData.data || {});
      } else {
        // Mock data for development
        setMockData();
      }
    } catch (error) {
      console.error("Error loading stores data:", error);
      setMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const setMockData = () => {
    setStores([
      {
        id: 1,
        name: "متجر الصباح",
        address: "شارع الجامعة، دمشق",
        phone: "011-123456",
        owner_name: "أحمد علي",
        area: "المنطقة الشمالية",
        registration_date: "2023-01-15",
        last_order_date: "2024-01-15",
        payment_status: "paid",
        total_orders: 156,
        total_revenue: 4250.75,
        avg_order_value: 27.25,
        order_frequency: "daily",
        performance_rating: 4.8,
        payment_method: "cash",
        credit_limit: 500.00,
        current_balance: -45.50,
        order_patterns: {
          daily_average: 3.2,
          weekly_total: 22,
          monthly_total: 95,
          peak_hours: ["08:00", "14:00"],
          preferred_products: ["خبز أبيض", "خبز أسمر", "كعك السمسم"]
        },
        delivery_info: {
          preferred_time: "09:00-10:00",
          special_instructions: "مدخل خلفي، الطابق الأول",
          delivery_success_rate: 98.5
        },
        recent_issues: [],
        notes: "عميل ممتاز، دفع منتظم"
      },
      {
        id: 2,
        name: "مخبز النور",
        address: "حي المزة، دمشق",
        phone: "011-789012",
        owner_name: "محمد خالد",
        area: "المنطقة الجنوبية",
        registration_date: "2023-03-22",
        last_order_date: "2024-01-14",
        payment_status: "partial",
        total_orders: 89,
        total_revenue: 2180.25,
        avg_order_value: 24.50,
        order_frequency: "weekly",
        performance_rating: 3.9,
        payment_method: "mixed",
        credit_limit: 300.00,
        current_balance: -125.75,
        order_patterns: {
          daily_average: 1.8,
          weekly_total: 13,
          monthly_total: 56,
          peak_hours: ["07:00", "16:00"],
          preferred_products: ["خبز أبيض", "كعك السمسم"]
        },
        delivery_info: {
          preferred_time: "08:00-09:00",
          special_instructions: "باب أزرق، رقم 15",
          delivery_success_rate: 92.1
        },
        recent_issues: [
          {
            type: "payment_delay",
            description: "تأخر في دفع الفاتورة",
            date: "2024-01-10",
            status: "resolved"
          }
        ],
        notes: "يحتاج متابعة للدفعات"
      },
      {
        id: 3,
        name: "سوبر ماركت الحياة",
        address: "حي المالكي، دمشق",
        phone: "011-345678",
        owner_name: "فاطمة سعد",
        area: "المنطقة الوسطى",
        registration_date: "2023-02-10",
        last_order_date: "2024-01-10",
        payment_status: "overdue",
        total_orders: 45,
        total_revenue: 1850.00,
        avg_order_value: 41.11,
        order_frequency: "irregular",
        performance_rating: 3.2,
        payment_method: "credit",
        credit_limit: 200.00,
        current_balance: -180.25,
        order_patterns: {
          daily_average: 0.8,
          weekly_total: 6,
          monthly_total: 25,
          peak_hours: ["10:00", "15:00"],
          preferred_products: ["خبز أبيض", "خبز أسمر"]
        },
        delivery_info: {
          preferred_time: "10:00-11:00",
          special_instructions: "اتصال قبل التوصيل",
          delivery_success_rate: 85.2
        },
        recent_issues: [
          {
            type: "payment_overdue",
            description: "دين متأخر أكثر من 30 يوم",
            date: "2024-01-05",
            status: "pending"
          },
          {
            type: "order_reduction",
            description: "انخفاض في معدل الطلبات",
            date: "2024-01-08",
            status: "monitoring"
          }
        ],
        notes: "يحتاج متابعة عاجلة للديون"
      }
    ]);

    setAnalytics({
      totalStores: 3,
      activeStores: 2,
      averageOrderValue: 30.95,
      topPerformers: [
        { name: "متجر الصباح", revenue: 4250.75, growth: 15.2 },
        { name: "مخبز النور", revenue: 2180.25, growth: 8.5 }
      ],
      paymentAnalysis: {
        paid: 1,
        partial: 1,
        overdue: 1,
        total_outstanding: 351.50
      }
    });
  };

  // Filter stores
  const filteredStores = stores.filter(store => {
    const matchesSearch = !filters.search || 
      store.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      store.address.toLowerCase().includes(filters.search.toLowerCase()) ||
      store.owner_name.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesArea = filters.area === "all" || store.area === filters.area;
    const matchesPayment = filters.payment_status === "all" || store.payment_status === filters.payment_status;
    const matchesFrequency = filters.order_frequency === "all" || store.order_frequency === filters.order_frequency;
    
    return matchesSearch && matchesArea && matchesPayment && matchesFrequency;
  });

  // Helper functions
  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: "bg-green-100 text-green-800 border-green-200",
      partial: "bg-yellow-100 text-yellow-800 border-yellow-200", 
      overdue: "bg-red-100 text-red-800 border-red-200",
      credit: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return colors[status] || colors.paid;
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      paid: "مدفوع",
      partial: "جزئي",
      overdue: "متأخر",
      credit: "دائن"
    };
    return texts[status] || "غير معروف";
  };

  const getPerformanceColor = (rating) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const calculateDaysSinceLastOrder = (lastOrderDate) => {
    const today = new Date();
    const lastOrder = new Date(lastOrderDate);
    const diffTime = Math.abs(today - lastOrder);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Components
  const StoreCard = ({ store, onSelect }) => {
    const daysSinceLastOrder = calculateDaysSinceLastOrder(store.last_order_date);
    const hasIssues = store.recent_issues && store.recent_issues.length > 0;
    const isOverdue = store.payment_status === "overdue";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl border-2 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
          selectedStore?.id === store.id ? "border-blue-500 bg-blue-50" : 
          isOverdue ? "border-red-200" : "border-gray-200"
        }`}
        onClick={() => onSelect(store)}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isOverdue ? "bg-red-100" : "bg-blue-100"
              }`}>
                <Store className={`w-6 h-6 ${isOverdue ? "text-red-600" : "text-blue-600"}`} />
              </div>
              <div className="mr-3">
                <h4 className="font-semibold text-gray-900">{store.name}</h4>
                <p className="text-sm text-gray-600">{store.owner_name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(store.payment_status)}`}>
                {getPaymentStatusText(store.payment_status)}
              </span>
              {hasIssues && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <AlertTriangle className="w-3 h-3 ml-1" />
                    {store.recent_issues.length} قضية
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-start">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 ml-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">{store.address}</p>
              <p className="text-xs text-gray-500">{store.area}</p>
            </div>
          </div>

          <div className="flex items-center">
            <Phone className="w-4 h-4 text-gray-500 ml-2" />
            <p className="text-sm text-gray-600">{store.phone}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-600">إجمالي الطلبات</p>
              <p className="text-sm font-semibold text-gray-900">{store.total_orders}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">متوسط القيمة</p>
              <p className="text-sm font-semibold text-green-600">€{parseFloat(store.avg_order_value).toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">آخر طلب</p>
              <p className={`text-sm font-semibold ${daysSinceLastOrder > 7 ? "text-red-600" : "text-gray-900"}`}>
                {daysSinceLastOrder} يوم
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">التقييم</p>
              <p className={`text-sm font-semibold ${getPerformanceColor(store.performance_rating)}`}>
                {store.performance_rating}/5
              </p>
            </div>
          </div>

          {/* Balance */}
          {store.current_balance !== 0 && (
            <div className={`p-2 rounded-lg text-center ${
              store.current_balance < 0 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
            }`}>
              <p className="text-xs text-gray-600">الرصيد الحالي</p>
              <p className={`text-sm font-bold ${store.current_balance < 0 ? "text-red-600" : "text-green-600"}`}>
                €{Math.abs(store.current_balance).toFixed(2)} {store.current_balance < 0 ? "دين" : "دائن"}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-3 bg-gray-50 rounded-b-xl">
          <div className="flex gap-2">
            <EnhancedButton size="sm" variant="primary" className="flex-1">
              <Eye className="w-3 h-3 ml-1" />
              عرض
            </EnhancedButton>
            <EnhancedButton size="sm" variant="secondary" className="flex-1">
              <MessageSquare className="w-3 h-3 ml-1" />
              اتصال
            </EnhancedButton>
            <EnhancedButton size="sm" variant="secondary">
              <Navigation className="w-3 h-3" />
            </EnhancedButton>
          </div>
        </div>
      </motion.div>
    );
  };

  const StoreDetails = ({ store, onClose }) => (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="bg-white rounded-xl border-0 shadow-lg max-h-screen overflow-y-auto"
    >
      <div className="p-6 border-b border-gray-100 sticky top-0 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center ml-4">
              <Store className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
              <p className="text-gray-600">{store.owner_name}</p>
              <p className="text-sm text-gray-500">{store.phone}</p>
            </div>
          </div>
          <EnhancedButton onClick={onClose} variant="secondary" size="sm">
            <XCircle className="w-4 h-4" />
          </EnhancedButton>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Store Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">معلومات المتجر</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">العنوان</p>
                  <p className="font-medium text-gray-900">{store.address}</p>
                  <p className="text-sm text-gray-500">{store.area}</p>
                </div>
                <MapPin className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تاريخ التسجيل</p>
                  <p className="font-medium text-gray-900">{formatDate(store.registration_date)}</p>
                </div>
                <Calendar className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">الأداء والإحصائيات</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-blue-600">{store.total_orders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-green-600">€{parseFloat(store.total_revenue).toFixed(2)}</p>
                </div>
                <Euro className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط قيمة الطلب</p>
                  <p className="text-2xl font-bold text-purple-600">€{parseFloat(store.avg_order_value).toFixed(2)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تقييم الأداء</p>
                  <p className={`text-2xl font-bold ${getPerformanceColor(store.performance_rating)}`}>
                    {store.performance_rating}/5
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Order Patterns */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">أنماط الطلبات</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">متوسط يومي</p>
                <p className="font-semibold text-gray-900">{store.order_patterns.daily_average} طلب</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي أسبوعي</p>
                <p className="font-semibold text-gray-900">{store.order_patterns.weekly_total} طلب</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي شهري</p>
                <p className="font-semibold text-gray-900">{store.order_patterns.monthly_total} طلب</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">أوقات الذروة</p>
                <p className="font-semibold text-gray-900">{store.order_patterns.peak_hours.join(", ")}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">المنتجات المفضلة</p>
              <div className="flex flex-wrap gap-2">
                {store.order_patterns.preferred_products.map((product, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {product}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">معلومات الدفع</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">طريقة الدفع</p>
                <p className="font-semibold text-gray-900 capitalize">{store.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">حد الائتمان</p>
                <p className="font-semibold text-gray-900">€{parseFloat(store.credit_limit).toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">الرصيد الحالي</p>
                <p className={`font-bold text-lg ${store.current_balance < 0 ? "text-red-600" : "text-green-600"}`}>
                  €{Math.abs(store.current_balance).toFixed(2)} {store.current_balance < 0 ? "دين" : "دائن"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">معلومات التوصيل</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">الوقت المفضل</p>
                <p className="font-semibold text-gray-900">{store.delivery_info.preferred_time}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">تعليمات خاصة</p>
                <p className="font-semibold text-gray-900">{store.delivery_info.special_instructions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">معدل نجاح التوصيل</p>
                <p className="font-semibold text-green-600">{store.delivery_info.delivery_success_rate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Issues */}
        {store.recent_issues && store.recent_issues.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">القضايا الأخيرة</h4>
            <div className="space-y-2">
              {store.recent_issues.map((issue, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  issue.status === 'resolved' ? 'bg-green-50 border-green-400' : 
                  issue.status === 'pending' ? 'bg-red-50 border-red-400' : 
                  'bg-yellow-50 border-yellow-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{issue.description}</p>
                      <p className="text-sm text-gray-600">التاريخ: {formatDate(issue.date)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      issue.status === 'pending' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {issue.status === 'resolved' ? 'محلول' : 
                       issue.status === 'pending' ? 'معلق' : 'قيد المتابعة'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {store.notes && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">ملاحظات</h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-800">{store.notes}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <EnhancedButton variant="primary" className="flex-1">
            <Edit className="w-4 h-4 ml-1" />
            تعديل المتجر
          </EnhancedButton>
          <EnhancedButton variant="secondary" className="flex-1">
            <History className="w-4 h-4 ml-1" />
            سجل الطلبات
          </EnhancedButton>
          <EnhancedButton variant="secondary">
            <Phone className="w-4 h-4" />
          </EnhancedButton>
        </div>
      </div>
    </motion.div>
  );

  const AnalyticsView = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border-0 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي المحلات</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalStores}</p>
            </div>
            <Store className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border-0 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المحلات النشطة</p>
              <p className="text-3xl font-bold text-green-600">{analytics.activeStores}</p>
            </div>
            <Activity className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border-0 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">متوسط قيمة الطلب</p>
              <p className="text-3xl font-bold text-purple-600">€{parseFloat(analytics.averageOrderValue).toFixed(2)}</p>
            </div>
            <BarChart3 className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border-0 shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ديون متأخرة</p>
              <p className="text-3xl font-bold text-red-600">€{parseFloat(analytics.paymentAnalysis?.total_outstanding || 0).toFixed(2)}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl border-0 shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">أفضل المحلات أداءً</h3>
        <div className="space-y-3">
          {analytics.topPerformers.map((store, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">{store.name}</h5>
                  <p className="text-sm text-gray-600">نمو: {store.growth}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">€{parseFloat(store.revenue).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner text="جاري تحميل بيانات المحلات..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border-0 shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl ml-4">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">إدارة المحلات</h2>
              <p className="text-gray-600">
                تحليل شامل وإدارة متقدمة لجميع المحلات - {filteredStores.length} من {stores.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
                }`}
              >
                شبكة
              </button>
              <button
                onClick={() => setViewMode("analytics")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "analytics" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
                }`}
              >
                تحليلات
              </button>
            </div>

            <EnhancedButton
              onClick={loadStoresData}
              variant="secondary"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              تحديث
            </EnhancedButton>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-6">
          <EnhancedInput
            type="text"
            placeholder="البحث في المحلات..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            icon={<Search className="w-4 h-4" />}
            size="sm"
            className="w-64"
          />

          <select
            value={filters.payment_status}
            onChange={(e) => setFilters(prev => ({ ...prev, payment_status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">جميع حالات الدفع</option>
            <option value="paid">مدفوع</option>
            <option value="partial">جزئي</option>
            <option value="overdue">متأخر</option>
          </select>

          <select
            value={filters.order_frequency}
            onChange={(e) => setFilters(prev => ({ ...prev, order_frequency: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">جميع معدلات الطلب</option>
            <option value="daily">يومي</option>
            <option value="weekly">أسبوعي</option>
            <option value="irregular">غير منتظم</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "analytics" ? (
        <AnalyticsView />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stores List */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onSelect={setSelectedStore}
                />
              ))}
              {filteredStores.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد محلات</h3>
                  <p className="text-gray-600">لا يوجد محلات تطابق المعايير المحددة</p>
                </div>
              )}
            </div>
          </div>

          {/* Store Details */}
          <div className="lg:col-span-1">
            <AnimatePresence>
              {selectedStore ? (
                <StoreDetails
                  key={selectedStore.id}
                  store={selectedStore}
                  onClose={() => setSelectedStore(null)}
                />
              ) : (
                <div className="bg-white rounded-xl border-0 shadow-lg p-8 text-center">
                  <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">اختر متجر للعرض</h3>
                  <p className="text-gray-600">انقر على أي متجر لعرض التفاصيل الكاملة</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement; 