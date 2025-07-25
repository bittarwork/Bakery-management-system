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
// Import the updated distribution service
import distributionService from "../../services/distributionService";
import orderService from "../../services/orderService"; // Added import for orderService

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

      // Load actual orders with distributor assignments for the selected date
      const ordersResponse = await orderService.getOrders({
        date_from: selectedDate,
        date_to: selectedDate,
        status: 'confirmed,in_progress', // Only active orders
        limit: 100
      });

      if (ordersResponse.success) {
        const ordersData = ordersResponse.data?.orders || ordersResponse.data || [];
        
        // Transform orders data to distributor tracking format
        const distributorMap = new Map();
        
        ordersData.forEach(order => {
          if (order.assigned_distributor_id) {
            const distributorId = order.assigned_distributor_id;
            
            if (!distributorMap.has(distributorId)) {
              distributorMap.set(distributorId, {
                id: distributorId,
                name: order.distributor_name || `موزع ${distributorId}`,
                phone: order.distributor_phone || '',
                status: order.status === 'in_progress' ? 'active' : 'pending',
                current_location: {
                  address: order.store?.address || 'غير محدد',
                  lat: order.store?.latitude || 33.8938,
                  lng: order.store?.longitude || 35.5018,
                  last_update: new Date().toISOString()
                },
                orders: [],
                todayOrders: 0,
                completedOrders: 0,
                todayRevenue: 0,
                current_route: {
                  current_stop: '',
                  completed_stops: 0,
                  total_stops: 0
                }
              });
            }
            
            const distributor = distributorMap.get(distributorId);
            distributor.orders.push(order);
            distributor.todayOrders++;
            
            if (order.status === 'delivered') {
              distributor.completedOrders++;
            }
            
            distributor.todayRevenue += parseFloat(order.total_amount_eur || 0);
            
            // Update current route info
            distributor.current_route.total_stops = distributor.orders.length;
            distributor.current_route.completed_stops = distributor.completedOrders;
            
            if (order.status === 'in_progress') {
              distributor.current_route.current_stop = order.store?.name || '';
              distributor.current_location.address = order.store?.address || '';
              distributor.current_location.lat = order.store?.latitude || 33.8938;
              distributor.current_location.lng = order.store?.longitude || 35.5018;
            }
          }
        });
        
        // Convert map to array
        const trackingData = Array.from(distributorMap.values());
        setDistributors(trackingData);
        setLastUpdate(new Date());
      } else {
        console.warn('Failed to load tracking data, using fallback');
        setDistributors([]);
      }

    } catch (error) {
      console.error('Error loading tracking data:', error);
      // Fallback to mock data for development
      setDistributors(getMockTrackingData());
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development/fallback
  const getMockTrackingData = () => {
    return [
      {
        id: 1,
        name: "أحمد محمد",
        phone: "+961 71 123456",
        status: "active",
        current_location: {
          address: "شارع الحمراء، بيروت",
          lat: 33.8938,
          lng: 35.5018,
          last_update: new Date().toISOString()
        },
        orders: [],
        todayOrders: 5,
        completedOrders: 3,
        todayRevenue: 245.50,
        current_route: {
          current_stop: "متجر الحمراء الرئيسي",
          completed_stops: 3,
          total_stops: 5
        }
      },
      {
        id: 2,
        name: "محمد علي",
        phone: "+961 71 234567",
        status: "active",
        current_location: {
          address: "شارع فردان، بيروت",
          lat: 33.8869,
          lng: 35.5131,
          last_update: new Date().toISOString()
        },
        orders: [],
        todayOrders: 4,
        completedOrders: 2,
        todayRevenue: 180.25,
        current_route: {
          current_stop: "سوبر ماركت فردان",
          completed_stops: 2,
          total_stops: 4
        }
      }
    ];
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
    const isOnline = distributor.device_info?.last_online 
      ? new Date() - new Date(distributor.device_info.last_online) < 5 * 60 * 1000 
      : false; // 5 minutes

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
              <p className="text-xs text-gray-600">
                {distributor.current_location?.address || "غير محدد"}
              </p>
              <p className="text-xs text-gray-500">
                آخر تحديث: {distributor.current_location?.last_update 
                  ? formatLastUpdate(distributor.current_location.last_update)
                  : "غير متوفر"
                }
              </p>
            </div>
          </div>

          {distributor.current_route?.current_stop && (
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
              <span>
                {distributor.current_route?.completed_stops || 0}/{distributor.current_route?.total_stops || 0}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ 
                  width: `${
                    distributor.current_route?.total_stops 
                      ? ((distributor.current_route.completed_stops || 0) / distributor.current_route.total_stops) * 100
                      : 0
                  }%` 
                }}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-600">الطلبات المسلمة</p>
              <p className="text-sm font-semibold text-gray-900">
                {distributor.orders_delivered_today || distributor.progress?.completed || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">نقاط الكفاءة</p>
              <p className="text-sm font-semibold text-green-600">
                {distributor.efficiency_score || Math.round((distributor.progress?.percentage || 0) * 0.9 + 10)}%
              </p>
            </div>
          </div>
        </div>

        {/* Device Info */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Battery className="w-3 h-3 ml-1" />
              <span>{distributor.device_info?.battery_level || 'N/A'}%</span>
            </div>
            <div className="flex items-center">
              <Signal className="w-3 h-3 ml-1" />
              <span>{distributor.device_info?.signal_strength || 0}/5</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 ml-1" />
              <span>آخر نشاط: {distributor.device_info?.last_online ? formatLastUpdate(distributor.device_info.last_online) : 'غير متاح'}</span>
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
                  <p className="text-2xl font-bold text-blue-600">
                    {distributor.progress?.percentage || 0}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">نقاط الكفاءة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {distributor.efficiency_score || 85}%
                  </p>
                </div>
                <Euro className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الطلبات المكتملة</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {distributor.orders_delivered_today || distributor.progress?.completed || 0}
                  </p>
                </div>
                <Timer className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {distributor.total_orders || distributor.progress?.total || 0}
                  </p>
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

  // Interactive Map Component
  const InteractiveMap = () => {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <MapIcon className="w-5 h-5 text-blue-600 ml-2" />
            خريطة التتبع المباشر
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            مواقع الموزعين والطلبات في الوقت الفعلي
          </p>
        </div>
        
        <div className="relative h-96 bg-gradient-to-br from-blue-100 to-green-100">
          {/* Map Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                خريطة تفاعلية
              </p>
              <p className="text-sm text-gray-500 mb-4">
                عرض مواقع الموزعين والطلبات
              </p>
              
              {/* Distributor Markers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {distributors.map((distributor, index) => (
                  <div 
                    key={distributor.id}
                    className="bg-white rounded-lg p-3 shadow-md border border-gray-200"
                    style={{
                      position: 'relative',
                      left: `${(index % 2) * 200 - 100}px`,
                      top: `${Math.floor(index / 2) * 80 - 40}px`
                    }}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        distributor.status === 'active' 
                          ? 'bg-green-500 animate-pulse' 
                          : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {distributor.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {distributor.current_location.address}
                        </p>
                        <p className="text-xs text-blue-600">
                          {distributor.current_route.completed_stops}/{distributor.current_route.total_stops} طلبات
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">وسائل الإيضاح</p>
            <div className="space-y-1">
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>موزع نشط</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                <span>موزع غير نشط</span>
              </div>
              <div className="flex items-center text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>موقع طلب</span>
              </div>
            </div>
          </div>

          {/* Real-time Update Indicator */}
          <div className="absolute top-4 right-4 bg-white rounded-lg p-2 shadow-lg">
            <div className="flex items-center text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-gray-700">تحديث مباشر</span>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <button className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                <Navigation2 className="w-4 h-4 ml-1" />
                توسيط الخريطة
              </button>
              <button className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors">
                <RefreshCw className="w-4 h-4 ml-1" />
                تحديث المواقع
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                شبكة
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                قائمة
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "map"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                خريطة
              </button>
            </div>
            
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
      {viewMode === "map" ? (
        // Map View
        <InteractiveMap />
      ) : (
        // Grid/List View
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distributors List */}
          <div className="lg:col-span-2">
            {viewMode === "grid" ? (
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
            ) : (
              // List View
              <div className="space-y-4">
                {filteredDistributors.map((distributor) => (
                  <div
                    key={distributor.id}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => setSelectedDistributor(distributor)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 ${
                          distributor.status === 'active' 
                            ? 'bg-green-500 animate-pulse' 
                            : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{distributor.name}</h3>
                          <p className="text-sm text-gray-600">{distributor.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">الطلبات اليوم</p>
                        <p className="text-xl font-bold text-blue-600">
                          {distributor.current_route.completed_stops}/{distributor.current_route.total_stops}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">الموقع الحالي:</span>
                        <span className="text-gray-900">{distributor.current_location.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">الإيرادات:</span>
                        <span className="text-green-600 font-semibold">€{distributor.todayRevenue}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredDistributors.length === 0 && (
                  <div className="text-center py-12">
                    <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد موزعون</h3>
                    <p className="text-gray-600">لا يوجد موزعون متاحون بالمعايير المحددة</p>
                  </div>
                )}
              </div>
            )}
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
      )}
    </div>
  );
};

export default LiveDistributorTracking; 