import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Map,
  MapPin,
  Navigation,
  Route,
  Truck,
  Clock,
  Target,
  Settings,
  RotateCcw,
  Zap,
  Eye,
  Users,
  Store,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Square,
  RefreshCw,
  Maximize2,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Layers,
  Compass,
  Activity,
  Timer
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import { toast } from "react-hot-toast";

const MapsSystem = ({ selectedDate }) => {
  const [activeView, setActiveView] = useState("live");
  const [isLoading, setIsLoading] = useState(false);
  const [mapData, setMapData] = useState({
    distributors: [],
    routes: [],
    stores: [],
    trafficData: {
      overall: "جاري التحميل...",
      zones: []
    }
  });

  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [showRouteOptimization, setShowRouteOptimization] = useState(false);
  const [mapSettings, setMapSettings] = useState({
    autoRefresh: true,
    showTraffic: true,
    showStores: true,
    showRoutes: true,
    refreshInterval: 30
  });

  useEffect(() => {
    loadMapData();
    
    if (mapSettings.autoRefresh) {
      const interval = setInterval(loadMapData, mapSettings.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [selectedDate, mapSettings.autoRefresh, mapSettings.refreshInterval]);

  const loadMapData = async () => {
    setIsLoading(true);
    try {
      // Mock data - سيتم استبداله بـ API calls حقيقية
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData = {
        distributors: [
          {
            id: 1,
            name: "أحمد محمد",
            vehicle: "شاحنة صغيرة - ABC123",
            currentLocation: { lat: 33.5138, lng: 36.2765 },
            currentAddress: "شارع الحمرا، بيروت",
            status: "active",
            route: "المسار الشمالي",
            progress: 65,
            eta: "14:30",
            speed: 35,
            battery: 78,
            signal: 95,
            totalStops: 12,
            completedStops: 8,
            remainingStops: 4,
            dayRevenue: 890.50,
            alerts: [
              { type: "traffic", message: "زحمة مرورية خفيفة" }
            ]
          },
          {
            id: 2,
            name: "سارة أحمد",
            vehicle: "دراجة نارية - XYZ789",
            currentLocation: { lat: 33.5000, lng: 36.3000 },
            currentAddress: "منطقة الأشرفية، بيروت",
            status: "delayed",
            route: "المسار الجنوبي", 
            progress: 40,
            eta: "15:45",
            speed: 25,
            battery: 45,
            signal: 88,
            totalStops: 8,
            completedStops: 3,
            remainingStops: 5,
            dayRevenue: 456.75,
            alerts: [
              { type: "delay", message: "تأخير 15 دقيقة" },
              { type: "battery", message: "بطارية منخفضة" }
            ]
          },
          {
            id: 3,
            name: "محمد علي",
            vehicle: "شاحنة متوسطة - DEF456",
            currentLocation: { lat: 33.4800, lng: 36.2500 },
            currentAddress: "منطقة المزرعة، بيروت",
            status: "break",
            route: "المسار الشرقي",
            progress: 80,
            eta: "13:45",
            speed: 0,
            battery: 92,
            signal: 78,
            totalStops: 15,
            completedStops: 12,
            remainingStops: 3,
            dayRevenue: 1234.25,
            alerts: []
          }
        ],
        routes: [
          {
            id: 1,
            name: "المسار الشمالي",
            distributor: "أحمد محمد",
            status: "active",
            totalDistance: "45 كم",
            estimatedTime: "4 ساعات",
            stores: 12,
            completedStores: 8,
            efficiency: 92,
            coordinates: [
              { lat: 33.5138, lng: 36.2765 },
              { lat: 33.5200, lng: 36.2800 },
              { lat: 33.5300, lng: 36.2900 }
            ]
          },
          {
            id: 2,
            name: "المسار الجنوبي",
            distributor: "سارة أحمد",
            status: "delayed",
            totalDistance: "32 كم",
            estimatedTime: "3 ساعات",
            stores: 8,
            completedStores: 3,
            efficiency: 75,
            coordinates: [
              { lat: 33.5000, lng: 36.3000 },
              { lat: 33.4900, lng: 36.3100 },
              { lat: 33.4800, lng: 36.3200 }
            ]
          }
        ],
        stores: [
          { id: 1, name: "متجر الصباح", location: { lat: 33.5200, lng: 36.2800 }, status: "pending" },
          { id: 2, name: "مخبز النور", location: { lat: 33.5300, lng: 36.2900 }, status: "completed" },
          { id: 3, name: "متجر السلام", location: { lat: 33.4900, lng: 36.3100 }, status: "in_progress" }
        ],
        trafficData: {
          overall: "متوسط",
          zones: [
            { name: "وسط بيروت", level: "عالي", color: "red" },
            { name: "الحمرا", level: "متوسط", color: "yellow" },
            { name: "الأشرفية", level: "منخفض", color: "green" }
          ]
        }
      };
      
      setMapData(mockData);
    } catch (error) {
      toast.error("خطأ في تحميل بيانات الخريطة");
      console.error("Error loading map data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeRoute = async (routeId) => {
    try {
      toast.loading("جاري تحسين المسار...");
      // Mock optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.dismiss();
      toast.success("تم تحسين المسار بنجاح! توفير 15 دقيقة");
    } catch (error) {
      toast.dismiss();
      toast.error("خطأ في تحسين المسار");
    }
  };

  const sendMessageToDistributor = async (distributorId) => {
    try {
      toast.loading("جاري إرسال الرسالة...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.dismiss();
      toast.success("تم إرسال الرسالة للموزع");
    } catch (error) {
      toast.dismiss();
      toast.error("خطأ في إرسال الرسالة");
    }
  };

  const mapViews = [
    { key: "live", label: "التتبع المباشر", icon: Activity },
    { key: "routes", label: "إدارة المسارات", icon: Route },
    { key: "optimization", label: "تحسين المسارات", icon: Zap },
    { key: "analytics", label: "تحليلات الخرائط", icon: BarChart3 }
  ];

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      delayed: "bg-red-100 text-red-800",
      break: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800"
    };
    return colors[status] || colors.active;
  };

  const getStatusText = (status) => {
    const texts = {
      active: "نشط",
      delayed: "متأخر",
      break: "استراحة",
      completed: "مكتمل"
    };
    return texts[status] || "غير معروف";
  };

  const DistributorCard = ({ distributor, isSelected, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border-2 shadow-lg p-4 cursor-pointer transition-all ${
        isSelected ? "border-blue-500 shadow-xl" : "border-gray-200 hover:border-blue-300"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ml-3">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{distributor.name}</h4>
            <p className="text-sm text-gray-600">{distributor.vehicle}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(distributor.status)}`}>
          {getStatusText(distributor.status)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center">
            <MapPin className="w-4 h-4 ml-1" />
            الموقع الحالي:
          </span>
          <span className="font-medium text-right">{distributor.currentAddress}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center">
            <Target className="w-4 h-4 ml-1" />
            التقدم:
          </span>
          <span className="font-medium">{distributor.completedStops}/{distributor.totalStops} محل</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
            style={{ width: `${distributor.progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center">
            <Clock className="w-4 h-4 ml-1" />
            الوصول المتوقع:
          </span>
          <span className="font-medium">{distributor.eta}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-600">إيرادات اليوم:</span>
          <span className="font-bold text-green-600">€{distributor.dayRevenue}</span>
        </div>
      </div>

      {distributor.alerts.length > 0 && (
        <div className="mt-3 space-y-1">
          {distributor.alerts.map((alert, index) => (
            <div key={index} className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded">
              <AlertTriangle className="w-4 h-4 text-yellow-600 ml-2 flex-shrink-0" />
              <span className="text-xs text-yellow-800">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <EnhancedButton
          size="sm"
          variant="primary"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            // Focus on distributor on map
          }}
        >
          تتبع
        </EnhancedButton>
        <EnhancedButton
          size="sm"
          variant="secondary"
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            sendMessageToDistributor(distributor.id);
          }}
        >
          رسالة
        </EnhancedButton>
      </div>
    </motion.div>
  );

  const RouteCard = ({ route }) => (
    <Card className="border-0 shadow-lg">
      <CardHeader className={`bg-gradient-to-r ${
        route.status === 'active' ? 'from-green-50 to-emerald-50 border-green-100' :
        route.status === 'delayed' ? 'from-red-50 to-pink-50 border-red-100' :
        'from-gray-50 to-slate-50 border-gray-100'
      } border-b`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Route className="w-5 h-5 text-blue-600 ml-2" />
            {route.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
            {getStatusText(route.status)}
          </span>
        </div>
      </CardHeader>
      <CardBody className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{route.totalDistance}</p>
            <p className="text-sm text-gray-600">إجمالي المسافة</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{route.estimatedTime}</p>
            <p className="text-sm text-gray-600">الوقت المتوقع</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">الموزع:</span>
            <span className="font-medium">{route.distributor}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">المحلات:</span>
            <span className="font-medium">{route.completedStores}/{route.stores} مكتمل</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">الكفاءة:</span>
            <span className={`font-medium ${route.efficiency >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
              {route.efficiency}%
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <EnhancedButton
            size="sm"
            variant="primary"
            className="flex-1"
            onClick={() => optimizeRoute(route.id)}
            icon={<Zap className="w-4 h-4" />}
          >
            تحسين المسار
          </EnhancedButton>
          <EnhancedButton
            size="sm"
            variant="secondary"
            className="flex-1"
            icon={<Eye className="w-4 h-4" />}
          >
            عرض التفاصيل
          </EnhancedButton>
        </div>
      </CardBody>
    </Card>
  );

  const TrafficPanel = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Activity className="w-5 h-5 text-orange-600 ml-2" />
          حالة المرور
        </h3>
      </CardHeader>
      <CardBody className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">الحالة العامة:</span>
            <span className="font-semibold text-yellow-600">{mapData.trafficData.overall}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">المناطق:</h4>
          {mapData.trafficData.zones && mapData.trafficData.zones.length > 0 
            ? mapData.trafficData.zones.map((zone, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{zone.name}</span>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ml-2 bg-${zone.color}-500`} />
                  <span className="text-sm font-medium">{zone.level}</span>
                </div>
              </div>
            ))
            : (
              <div className="text-center text-gray-500 py-4">
                جاري تحميل بيانات المرور...
              </div>
            )
          }
        </div>
      </CardBody>
    </Card>
  );

  const MapSettings = () => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <Settings className="w-5 h-5 text-purple-600 ml-2" />
          إعدادات الخريطة
        </h3>
      </CardHeader>
      <CardBody className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">التحديث التلقائي</span>
            <button
              onClick={() => setMapSettings(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                mapSettings.autoRefresh ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                mapSettings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700">عرض المرور</span>
            <button
              onClick={() => setMapSettings(prev => ({ ...prev, showTraffic: !prev.showTraffic }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                mapSettings.showTraffic ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                mapSettings.showTraffic ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700">عرض المحلات</span>
            <button
              onClick={() => setMapSettings(prev => ({ ...prev, showStores: !prev.showStores }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                mapSettings.showStores ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                mapSettings.showStores ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700">عرض المسارات</span>
            <button
              onClick={() => setMapSettings(prev => ({ ...prev, showRoutes: !prev.showRoutes }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                mapSettings.showRoutes ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                mapSettings.showRoutes ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">فترة التحديث (ثانية)</label>
            <select
              value={mapSettings.refreshInterval}
              onChange={(e) => setMapSettings(prev => ({ 
                ...prev, 
                refreshInterval: parseInt(e.target.value) 
              }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={15}>15 ثانية</option>
              <option value={30}>30 ثانية</option>
              <option value={60}>دقيقة واحدة</option>
              <option value={300}>5 دقائق</option>
            </select>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Map className="w-6 h-6 text-blue-600 ml-2" />
            نظام الخرائط والمسارات
          </h2>
          <p className="text-gray-600 mt-1">تتبع مباشر وإدارة ذكية للمسارات</p>
        </div>
        
        <div className="flex items-center gap-3">
          <EnhancedButton
            onClick={loadMapData}
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            تحديث
          </EnhancedButton>
          <EnhancedButton
            onClick={() => setShowRouteOptimization(!showRouteOptimization)}
            variant="primary"
            icon={<Zap className="w-4 h-4" />}
          >
            تحسين تلقائي
          </EnhancedButton>
        </div>
      </div>

      {/* View Tabs */}
      <Card className="border-0 shadow-lg">
        <div className="flex overflow-x-auto">
          {mapViews.map((view) => (
            <button
              key={view.key}
              onClick={() => setActiveView(view.key)}
              className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeView === view.key
                  ? "text-blue-600 border-blue-600 bg-blue-50"
                  : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <view.icon className="w-4 h-4 ml-2" />
              {view.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-lg h-[600px]">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Compass className="w-5 h-5 text-blue-600 ml-2" />
                  الخريطة التفاعلية
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">آخر تحديث: الآن</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0 relative">
              {/* Mock Map */}
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">خريطة تفاعلية</h3>
                  <p className="text-gray-600 mb-4">عرض مباشر لجميع الموزعين والمسارات</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>🟢 {mapData.distributors.filter(d => d.status === 'active').length} موزع نشط</p>
                    <p>🟡 {mapData.distributors.filter(d => d.status === 'delayed').length} موزع متأخر</p>
                    <p>🔵 {mapData.distributors.filter(d => d.status === 'break').length} موزع في استراحة</p>
                  </div>
                </div>
              </div>
              
              {/* Map Controls */}
              <div className="absolute top-4 left-4 space-y-2">
                <EnhancedButton size="sm" variant="secondary" icon={<Maximize2 className="w-4 h-4" />} />
                <EnhancedButton size="sm" variant="secondary" icon={<Layers className="w-4 h-4" />} />
                <EnhancedButton size="sm" variant="secondary" icon={<Filter className="w-4 h-4" />} />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {activeView === "live" && (
            <>
              <TrafficPanel />
              <MapSettings />
            </>
          )}
          
          {activeView === "routes" && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900">المسارات النشطة</h3>
              {mapData.routes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          )}
          
          {activeView === "optimization" && (
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Zap className="w-5 h-5 text-green-600 ml-2" />
                  تحسين المسارات
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">25%</p>
                    <p className="text-sm text-gray-600">توفير في الوقت</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">15%</p>
                    <p className="text-sm text-gray-600">توفير في الوقود</p>
                  </div>
                  <EnhancedButton
                    variant="primary"
                    className="w-full"
                    icon={<Play className="w-4 h-4" />}
                  >
                    تشغيل التحسين التلقائي
                  </EnhancedButton>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Distributors List */}
      {activeView === "live" && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 text-blue-600 ml-2" />
            الموزعين النشطين ({mapData.distributors.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mapData.distributors.map((distributor) => (
              <DistributorCard
                key={distributor.id}
                distributor={distributor}
                isSelected={selectedDistributor?.id === distributor.id}
                onClick={() => setSelectedDistributor(distributor)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapsSystem; 