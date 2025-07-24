import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Navigation,
  MapPin,
  Clock,
  Package,
  User,
  Phone,
  Car,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Eye,
  MessageSquare,
  Route,
  Timer,
  Activity,
  Battery,
  Signal,
  Zap,
  Truck,
  Store,
  Euro,
  Target,
  TrendingUp,
  TrendingDown,
  Coffee,
  Pause,
  Play,
  MoreVertical,
  Settings,
  Bell,
  Map as MapIcon,
  Navigation2,
  CircleDot,
  MapPin as LocationPin,
  Compass,
  Shield,
  AlertCircle,
  Info
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import LoadingSpinner from "../ui/LoadingSpinner";

/**
 * Live Distributor Tracking Component
 * Real-time tracking of distributors with location, status, and performance
 */
const LiveDistributorTracking = ({ selectedDate }) => {
  // States
  const [distributors, setDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [viewMode, setViewMode] = useState("grid"); // grid, list, map

  // Filter states
  const [filters, setFilters] = useState({
    status: "all", // all, active, inactive, delayed
    zone: "all",
    search: ""
  });

  // Load distributor tracking data
  useEffect(() => {
    loadTrackingData();
    
    // Set up auto-refresh
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadTrackingData, refreshInterval * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedDate, autoRefresh, refreshInterval]);

  const loadTrackingData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/distribution/live-tracking?date=${selectedDate}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDistributors(data.data || []);
        setLastUpdate(new Date());
      } else {
        // Mock data for development
        setMockTrackingData();
      }
    } catch (error) {
      console.error("Error loading tracking data:", error);
      setMockTrackingData();
    } finally {
      setIsLoading(false);
    }
  };

  const setMockTrackingData = () => {
    setDistributors([
      {
        id: 1,
        name: "أحمد محمد",
        phone: "0944-123456",
        vehicle: "فان صغير - ABC123",
        status: "active",
        current_location: {
          address: "شارع الجامعة، دمشق",
          lat: 33.5138,
          lng: 36.2765,
          last_update: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        },
        current_route: {
          total_stops: 12,
          completed_stops: 7,
          remaining_stops: 5,
          estimated_completion: "14:30",
          current_stop: "متجر الصباح"
        },
        performance: {
          completion_rate: 95.5,
          avg_delivery_time: 8.5,
          customer_rating: 4.8,
          orders_delivered_today: 7,
          revenue_collected: 485.50
        },
        device_info: {
          battery_level: 78,
          signal_strength: 4,
          app_version: "2.1.0",
          last_online: new Date(Date.now() - 2 * 60 * 1000)
        },
        alerts: [
          {
            type: "delay",
            message: "تأخير عن الموعد المحدد بـ15 دقيقة",
            timestamp: new Date(Date.now() - 10 * 60 * 1000)
          }
        ]
      },
      {
        id: 2,
        name: "خالد السوري",
        phone: "0933-789012",
        vehicle: "شاحنة متوسطة - XYZ789",
        status: "active",
        current_location: {
          address: "حي المزة، دمشق",
          lat: 33.5028,
          lng: 36.2441,
          last_update: new Date(Date.now() - 3 * 60 * 1000)
        },
        current_route: {
          total_stops: 15,
          completed_stops: 10,
          remaining_stops: 5,
          estimated_completion: "15:45",
          current_stop: "مخبز النور"
        },
        performance: {
          completion_rate: 88.2,
          avg_delivery_time: 9.2,
          customer_rating: 4.6,
          orders_delivered_today: 10,
          revenue_collected: 720.25
        },
        device_info: {
          battery_level: 92,
          signal_strength: 5,
          app_version: "2.1.0",
          last_online: new Date(Date.now() - 1 * 60 * 1000)
        },
        alerts: []
      },
      {
        id: 3,
        name: "محمد العلي",
        phone: "0955-456789",
        vehicle: "دراجة نارية - MOT456",
        status: "inactive",
        current_location: {
          address: "المخبز الرئيسي، دمشق",
          lat: 33.5151,
          lng: 36.2967,
          last_update: new Date(Date.now() - 45 * 60 * 1000)
        },
        current_route: {
          total_stops: 8,
          completed_stops: 8,
          remaining_stops: 0,
          estimated_completion: "13:15",
          current_stop: null
        },
        performance: {
          completion_rate: 92.1,
          avg_delivery_time: 6.8,
          customer_rating: 4.9,
          orders_delivered_today: 8,
          revenue_collected: 380.75
        },
        device_info: {
          battery_level: 45,
          signal_strength: 3,
          app_version: "2.0.8",
          last_online: new Date(Date.now() - 30 * 60 * 1000)
        },
        alerts: [
          {
            type: "low_battery",
            message: "مستوى البطارية منخفض",
            timestamp: new Date(Date.now() - 20 * 60 * 1000)
          }
        ]
      }
    ]);
    setLastUpdate(new Date());
  };

  // Filter distributors
  const filteredDistributors = distributors.filter(distributor => {
    const matchesStatus = filters.status === "all" || distributor.status === filters.status;
    const matchesSearch = !filters.search || 
      distributor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      distributor.vehicle.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      delayed: "bg-red-100 text-red-800 border-red-200",
      offline: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    return colors[status] || colors.inactive;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <Activity className="w-4 h-4" />,
      inactive: <Pause className="w-4 h-4" />,
      delayed: <AlertTriangle className="w-4 h-4" />,
      offline: <XCircle className="w-4 h-4" />
    };
    return icons[status] || icons.inactive;
  };

  const getStatusText = (status) => {
    const texts = {
      active: "نشط",
      inactive: "غير نشط",
      delayed: "متأخر",
      offline: "غير متصل"
    };
    return texts[status] || "غير معروف";
  };

  const formatLastUpdate = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `منذ ${diffHours} ساعة`;
  };

  const sendMessageToDistributor = async (distributorId, message) => {
    try {
      const response = await fetch("/api/distribution/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          distributor_id: distributorId,
          message: message
        })
      });

      if (response.ok) {
        toast.success("تم إرسال الرسالة بنجاح");
      } else {
        toast.error("خطأ في إرسال الرسالة");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("خطأ في إرسال الرسالة");
    }
  };

  // Components
  const DistributorCard = ({ distributor, onSelect }) => {
    const hasAlerts = distributor.alerts && distributor.alerts.length > 0;
    const isOnline = new Date() - distributor.device_info.last_online < 5 * 60 * 1000; // 5 minutes

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl border-2 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
          selectedDistributor?.id === distributor.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
        onClick={() => onSelect(distributor)}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                {/* Online indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`} />
              </div>
              <div className="mr-3">
                <h4 className="font-semibold text-gray-900">{distributor.name}</h4>
                <p className="text-sm text-gray-600">{distributor.vehicle}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(distributor.status)}`}>
                {getStatusIcon(distributor.status)}
                <span className="mr-1">{getStatusText(distributor.status)}</span>
              </span>
              {hasAlerts && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Bell className="w-3 h-3 ml-1" />
                    {distributor.alerts.length} تنبيه
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current Location & Route */}
        <div className="p-4 space-y-3">
          <div className="flex items-start">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 ml-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">الموقع الحالي:</p>
              <p className="text-xs text-gray-600">{distributor.current_location.address}</p>
              <p className="text-xs text-gray-500">
                آخر تحديث: {formatLastUpdate(distributor.current_location.last_update)}
              </p>
            </div>
          </div>

          {distributor.current_route.current_stop && (
            <div className="flex items-start">
              <Store className="w-4 h-4 text-blue-500 mt-0.5 ml-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">المحل الحالي:</p>
                <p className="text-xs text-blue-600">{distributor.current_route.current_stop}</p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>التقدم</span>
              <span>{distributor.current_route.completed_stops}/{distributor.current_route.total_stops}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ 
                  width: `${(distributor.current_route.completed_stops / distributor.current_route.total_stops) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-600">الطلبات المسلمة</p>
              <p className="text-sm font-semibold text-gray-900">{distributor.performance.orders_delivered_today}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">المبلغ المحصل</p>
              <p className="text-sm font-semibold text-green-600">€{parseFloat(distributor.performance.revenue_collected).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Device Info */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Battery className="w-3 h-3 ml-1" />
              <span>{distributor.device_info.battery_level}%</span>
            </div>
            <div className="flex items-center">
              <Signal className="w-3 h-3 ml-1" />
              <span>{distributor.device_info.signal_strength}/5</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 ml-1" />
              <span>آخر نشاط: {formatLastUpdate(distributor.device_info.last_online)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3 bg-gray-50 rounded-b-xl">
          <div className="flex gap-2">
            <EnhancedButton size="sm" variant="primary" className="flex-1">
              <Navigation className="w-3 h-3 ml-1" />
              تتبع
            </EnhancedButton>
            <EnhancedButton size="sm" variant="secondary" className="flex-1">
              <MessageSquare className="w-3 h-3 ml-1" />
              رسالة
            </EnhancedButton>
            <EnhancedButton size="sm" variant="secondary">
              <Phone className="w-3 h-3" />
            </EnhancedButton>
          </div>
        </div>
      </motion.div>
    );
  };

  const DistributorDetails = ({ distributor, onClose }) => (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="bg-white rounded-xl border-0 shadow-lg"
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center ml-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{distributor.name}</h3>
              <p className="text-gray-600">{distributor.vehicle}</p>
              <p className="text-sm text-gray-500">{distributor.phone}</p>
            </div>
          </div>
          <EnhancedButton onClick={onClose} variant="secondary" size="sm">
            <XCircle className="w-4 h-4" />
          </EnhancedButton>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Performance Metrics */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">الأداء اليومي</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">معدل الإكمال</p>
                  <p className="text-2xl font-bold text-blue-600">{distributor.performance.completion_rate}%</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الإيرادات المحصلة</p>
                  <p className="text-2xl font-bold text-green-600">€{parseFloat(distributor.performance.revenue_collected).toFixed(2)}</p>
                </div>
                <Euro className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">متوسط وقت التسليم</p>
                  <p className="text-2xl font-bold text-purple-600">{distributor.performance.avg_delivery_time} دقيقة</p>
                </div>
                <Timer className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تقييم العملاء</p>
                  <p className="text-2xl font-bold text-yellow-600">{distributor.performance.customer_rating}/5</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Route Status */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">حالة المسار</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">المحطات المكتملة:</span>
                <span className="font-semibold">{distributor.current_route.completed_stops}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المحطات المتبقية:</span>
                <span className="font-semibold">{distributor.current_route.remaining_stops}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الإكمال المتوقع:</span>
                <span className="font-semibold">{distributor.current_route.estimated_completion}</span>
              </div>
              {distributor.current_route.current_stop && (
                <div className="flex justify-between">
                  <span className="text-gray-600">المحل الحالي:</span>
                  <span className="font-semibold text-blue-600">{distributor.current_route.current_stop}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {distributor.alerts && distributor.alerts.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">التنبيهات</h4>
            <div className="space-y-2">
              {distributor.alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'delay' ? 'bg-red-50 border-red-400' : 
                  alert.type === 'low_battery' ? 'bg-yellow-50 border-yellow-400' : 
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-start">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ml-2 ${
                      alert.type === 'delay' ? 'text-red-600' : 
                      alert.type === 'low_battery' ? 'text-yellow-600' : 
                      'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500">{formatLastUpdate(alert.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <EnhancedButton variant="primary" className="flex-1">
            <Navigation className="w-4 h-4 ml-1" />
            عرض على الخريطة
          </EnhancedButton>
          <EnhancedButton variant="secondary" className="flex-1">
            <MessageSquare className="w-4 h-4 ml-1" />
            إرسال رسالة
          </EnhancedButton>
          <EnhancedButton variant="secondary">
            <Phone className="w-4 h-4" />
          </EnhancedButton>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return <LoadingSpinner text="جاري تحميل بيانات التتبع..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border-0 shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl ml-4">
              <Navigation className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">تتبع الموزعين المباشر</h2>
              <p className="text-gray-600">
                آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Auto Refresh Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="autoRefresh" className="mr-2 text-sm text-gray-700">
                تحديث تلقائي
              </label>
            </div>

            {/* Refresh Interval */}
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
              disabled={!autoRefresh}
            >
              <option value={15}>15 ثانية</option>
              <option value={30}>30 ثانية</option>
              <option value={60}>دقيقة واحدة</option>
              <option value={300}>5 دقائق</option>
            </select>

            <EnhancedButton
              onClick={loadTrackingData}
              variant="secondary"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              تحديث الآن
            </EnhancedButton>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">الحالة:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="all">الكل ({distributors.length})</option>
              <option value="active">نشط ({distributors.filter(d => d.status === 'active').length})</option>
              <option value="inactive">غير نشط ({distributors.filter(d => d.status === 'inactive').length})</option>
              <option value="delayed">متأخر ({distributors.filter(d => d.status === 'delayed').length})</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">البحث:</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="اسم الموزع أو رقم المركبة..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm w-64"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distributors List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDistributors.map((distributor) => (
              <DistributorCard
                key={distributor.id}
                distributor={distributor}
                onSelect={setSelectedDistributor}
              />
            ))}
            {filteredDistributors.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد موزعون</h3>
                <p className="text-gray-600">لا يوجد موزعون متاحون بالمعايير المحددة</p>
              </div>
            )}
          </div>
        </div>

        {/* Distributor Details */}
        <div className="lg:col-span-1">
          <AnimatePresence>
            {selectedDistributor ? (
              <DistributorDetails
                key={selectedDistributor.id}
                distributor={selectedDistributor}
                onClose={() => setSelectedDistributor(null)}
              />
            ) : (
              <div className="bg-white rounded-xl border-0 shadow-lg p-8 text-center">
                <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">اختر موزع للعرض</h3>
                <p className="text-gray-600">انقر على أي موزع لعرض التفاصيل الكاملة</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LiveDistributorTracking; 