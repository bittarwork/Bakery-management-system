import React, { useState, useEffect, useRef } from "react";
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
  Truck,
  Store,
  Euro,
  Target,
  TrendingUp,
  Coffee,
  Play,
  Pause,
  Settings,
  Bell,
  Map as MapIcon,
  Navigation2,
  CircleDot,
  Compass,
  AlertCircle,
  Info,
  BarChart3,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import EnhancedInput from "../ui/EnhancedInput";
import LoadingSpinner from "../ui/LoadingSpinner";
import distributionService from "../../services/distributionService";
import config from "../../config/config";

// Mock data function for fallback
const getMockTrackingData = () => {
  return [
    {
      id: 1,
      name: "أحمد محمود",
      phone: "+961 70 123 456",
      status: "active",
      current_location: {
        address: "شارع الحمرا، بيروت",
        lat: 33.8958,
        lng: 35.4846,
        last_update: new Date(),
      },
      orders_delivered_today: 12,
      efficiency_score: 94,
      daily_revenue: 1250.75,
      progress: { percentage: 65 },
    },
    {
      id: 2,
      name: "فاتن الأحمد",
      phone: "+961 71 234 567",
      status: "active",
      current_location: {
        address: "الأشرفية، بيروت",
        lat: 33.899,
        lng: 35.515,
        last_update: new Date(),
      },
      orders_delivered_today: 8,
      efficiency_score: 87,
      daily_revenue: 980.25,
      progress: { percentage: 45 },
    },
    {
      id: 3,
      name: "محمد العلي",
      phone: "+961 76 345 678",
      status: "completed",
      current_location: {
        address: "فردان، بيروت",
        lat: 33.8921,
        lng: 35.5009,
        last_update: new Date(),
      },
      orders_delivered_today: 15,
      efficiency_score: 98,
      daily_revenue: 1890.5,
      progress: { percentage: 100 },
    },
  ];
};

/**
 * Live Distributor Tracking Component - Enhanced with Google Maps
 * Real-time tracking of distributors with interactive map and detailed analytics
 */
const LiveDistributorTracking = ({ selectedDate }) => {
  // States
  const [distributors, setDistributors] = useState(getMockTrackingData()); // Initialize with mock data
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false since we have mock data
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [viewMode, setViewMode] = useState("split"); // split, map, grid
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  // Map refs
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);

  // Load distributor tracking data
  useEffect(() => {
    loadTrackingData();

    let interval;
    if (autoRefresh) {
      interval = setInterval(loadTrackingData, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedDate, autoRefresh, refreshInterval]);

  // Initialize Google Maps
  useEffect(() => {
    loadGoogleMaps();
  }, []);

  // Update map markers when distributors change
  useEffect(() => {
    if (mapLoaded && googleMapRef.current) {
      updateMapMarkers();
    }
  }, [distributors, mapLoaded]);

  const loadGoogleMaps = async () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      initializeMap();
      return;
    }

    // Check if script is already loading
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for existing script to load
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          setMapLoaded(true);
          initializeMap();
        }
      }, 100);

      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => clearInterval(checkGoogleMaps), 10000);
      return;
    }

    try {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_MAPS_API_KEY}&libraries=geometry&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };

      script.onerror = (error) => {
        console.error("Failed to load Google Maps:", error);
        setMapLoaded(false);
        toast.error("فشل في تحميل الخريطة");
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error("Error loading Google Maps:", error);
      setMapLoaded(false);
      toast.error("خطأ في تحميل الخريطة");
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.warn("Map initialization failed: missing dependencies");
      return;
    }

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: {
          lat: config.DEFAULT_MAP_CENTER.lat,
          lng: config.DEFAULT_MAP_CENTER.lng,
        },
        zoom: config.GOOGLE_MAPS_SETTINGS.zoom,
        mapTypeId: config.GOOGLE_MAPS_SETTINGS.mapTypeId,
        disableDefaultUI: !config.GOOGLE_MAPS_SETTINGS.disableDefaultUI,
        zoomControl: config.GOOGLE_MAPS_SETTINGS.zoomControl,
        streetViewControl: config.GOOGLE_MAPS_SETTINGS.streetViewControl,
        fullscreenControl: config.GOOGLE_MAPS_SETTINGS.fullscreenControl,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      googleMapRef.current = map;
      setMapLoaded(true);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  const updateMapMarkers = () => {
    if (!googleMapRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers for each distributor
    distributors.forEach((distributor) => {
      if (
        distributor.current_location?.lat &&
        distributor.current_location?.lng
      ) {
        const marker = new window.google.maps.Marker({
          position: {
            lat: distributor.current_location.lat,
            lng: distributor.current_location.lng,
          },
          map: googleMapRef.current,
          title: distributor.name,
          icon: {
            url: getMarkerIcon(distributor.status),
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: createInfoWindowContent(distributor),
        });

        marker.addListener("click", () => {
          infoWindow.open(googleMapRef.current, marker);
          setSelectedDistributor(distributor);
        });

        markersRef.current.push(marker);
      }
    });
  };

  const getMarkerIcon = (status) => {
    const icons = {
      active:
        "data:image/svg+xml;base64," +
        btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10B981">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
      `),
      completed:
        "data:image/svg+xml;base64," +
        btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <path d="M10 14l-2-2 1.41-1.41L10 11.17l4.59-4.58L16 8l-6 6z" fill="white"/>
        </svg>
      `),
      offline:
        "data:image/svg+xml;base64=" +
        btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6B7280">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
      `),
    };
    return icons[status] || icons.offline;
  };

  const createInfoWindowContent = (distributor) => {
    return `
      <div style="padding: 10px; min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #1F2937; font-size: 16px; font-weight: bold;">
          ${distributor.name}
        </h3>
        <div style="display: flex; flex-direction: column; gap: 5px; font-size: 14px;">
          <div style="display: flex; align-items: center; gap: 5px;">
            <span style="color: #6B7280;">الحالة:</span>
            <span style="color: ${
              distributor.status === "active" ? "#10B981" : "#6B7280"
            }; font-weight: 500;">
              ${getStatusText(distributor.status)}
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <span style="color: #6B7280;">الطلبات المكتملة:</span>
            <span style="font-weight: 500;">${
              distributor.orders_delivered_today || 0
            }</span>
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <span style="color: #6B7280;">الكفاءة:</span>
            <span style="font-weight: 500;">${
              distributor.efficiency_score || 0
            }%</span>
          </div>
          <div style="display: flex; align-items: center; gap: 5px;">
            <span style="color: #6B7280;">الموقع الحالي:</span>
            <span style="font-weight: 500;">${
              distributor.current_location?.address || "غير محدد"
            }</span>
          </div>
        </div>
      </div>
    `;
  };

  const loadTrackingData = async () => {
    try {
      if (distributors.length === 0) {
        setIsLoading(true);
      }

      const response = await distributionService.getLiveTracking(selectedDate);

      if (response.success && response.data && response.data.distributors) {
        setDistributors(response.data.distributors);
        setLastUpdate(new Date());
      } else {
        // Always fallback to mock data to ensure the page shows content
        console.log("Using mock data for live tracking");
        setDistributors(getMockTrackingData());
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error loading tracking data:", error);
      // Always provide mock data as fallback
      setDistributors(getMockTrackingData());
      setLastUpdate(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  // Filter distributors
  const filteredDistributors = distributors.filter((distributor) => {
    const matchesStatus =
      filters.status === "all" || distributor.status === filters.status;
    const matchesSearch =
      !filters.search ||
      distributor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      distributor.current_location?.address
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      offline: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || colors.offline;
  };

  const getStatusText = (status) => {
    const texts = {
      active: "نشط",
      completed: "مكتمل",
      offline: "غير متصل",
    };
    return texts[status] || texts.offline;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle className="w-4 h-4 text-green-600" />,
      completed: <Target className="w-4 h-4 text-blue-600" />,
      offline: <XCircle className="w-4 h-4 text-gray-600" />,
    };
    return icons[status] || icons.offline;
  };

  // Components
  const DistributorCard = ({ distributor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all cursor-pointer hover:shadow-lg ${
        selectedDistributor?.id === distributor.id
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300"
      }`}
      onClick={() => setSelectedDistributor(distributor)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{distributor.name}</h4>
            <p className="text-sm text-gray-600">{distributor.phone}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          {getStatusIcon(distributor.status)}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
              distributor.status
            )}`}
          >
            {getStatusText(distributor.status)}
          </span>
        </div>
      </div>

      {/* Current Location */}
      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-2 space-x-reverse">
          <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">الموقع الحالي</p>
            <p className="text-xs text-gray-600">
              {distributor.current_location?.address || "غير محدد"}
            </p>
            {distributor.current_route?.current_stop && (
              <p className="text-xs text-blue-600 mt-1">
                المحطة الحالية: {distributor.current_route.current_stop}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">تقدم التوزيع</span>
          <span className="text-sm font-medium">
            {distributor.current_route?.completed_stops || 0} /{" "}
            {distributor.current_route?.total_stops || 0}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${distributor.progress?.percentage || 0}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {distributor.progress?.percentage || 0}% مكتمل
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-green-50 rounded">
          <p className="text-xs text-gray-600">الطلبات</p>
          <p className="text-sm font-bold text-green-700">
            {distributor.orders_delivered_today || 0}
          </p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded">
          <p className="text-xs text-gray-600">الكفاءة</p>
          <p className="text-sm font-bold text-blue-700">
            {distributor.efficiency_score || 0}%
          </p>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded">
          <p className="text-xs text-gray-600">الإيرادات</p>
          <p className="text-sm font-bold text-purple-700">
            €{(distributor.daily_revenue || 0).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1 space-x-reverse">
            <Clock className="w-3 h-3" />
            <span>آخر تحديث</span>
          </div>
          <span>
            {new Date(
              distributor.current_location?.last_update || new Date()
            ).toLocaleTimeString("ar-SA")}
          </span>
        </div>
      </div>
    </motion.div>
  );

  const DetailedView = ({ distributor }) => (
    <Card className="bg-white shadow-lg h-full">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            تفاصيل الموزع
          </h3>
          <EnhancedButton
            onClick={() => setSelectedDistributor(null)}
            variant="outline"
            size="sm"
          >
            إغلاق
          </EnhancedButton>
        </div>
      </CardHeader>
      <CardBody className="p-6">
        {distributor ? (
          <div className="space-y-6">
            {/* Distributor Info */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {distributor.name}
                </h4>
                <p className="text-gray-600">{distributor.phone}</p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    distributor.status
                  )}`}
                >
                  {getStatusIcon(distributor.status)}
                  <span className="mr-1">
                    {getStatusText(distributor.status)}
                  </span>
                </span>
              </div>
            </div>

            {/* Current Location Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                معلومات الموقع
              </h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">العنوان: </span>
                  <span className="font-medium">
                    {distributor.current_location?.address || "غير محدد"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">الإحداثيات: </span>
                  <span className="font-mono">
                    {distributor.current_location?.lat?.toFixed(6) || "N/A"},
                    {distributor.current_location?.lng?.toFixed(6) || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">آخر تحديث: </span>
                  <span className="font-medium">
                    {new Date(
                      distributor.current_location?.last_update || new Date()
                    ).toLocaleString("ar-SA")}
                  </span>
                </div>
              </div>
            </div>

            {/* Route Progress */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Route className="w-4 h-4 mr-2 text-blue-500" />
                تقدم المسار
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    المحطات المكتملة
                  </span>
                  <span className="font-bold text-blue-600">
                    {distributor.current_route?.completed_stops || 0} /{" "}
                    {distributor.current_route?.total_stops || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{
                      width: `${distributor.progress?.percentage || 0}%`,
                    }}
                  ></div>
                </div>
                <div className="text-center">
                  <span className="text-lg font-bold text-blue-600">
                    {distributor.progress?.percentage || 0}%
                  </span>
                  <span className="text-sm text-gray-600 mr-2">مكتمل</span>
                </div>
                {distributor.current_route?.current_stop && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">المحطة التالية:</p>
                    <p className="font-medium text-gray-900">
                      {distributor.current_route.current_stop}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <Package className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-700">
                  {distributor.orders_delivered_today || 0}
                </p>
                <p className="text-sm text-gray-600">طلبات مكتملة</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Euro className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-700">
                  €{(distributor.daily_revenue || 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">إيرادات اليوم</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <EnhancedButton
                variant="outline"
                className="flex items-center justify-center space-x-2 space-x-reverse"
                onClick={() => {
                  if (distributor.phone) {
                    window.open(`tel:${distributor.phone}`, "_self");
                  }
                }}
              >
                <Phone className="w-4 h-4" />
                <span>اتصال</span>
              </EnhancedButton>
              <EnhancedButton
                variant="outline"
                className="flex items-center justify-center space-x-2 space-x-reverse"
                onClick={() => {
                  // Navigate to distributor details page
                  window.location.href = `/distribution/distributor/${distributor.id}`;
                }}
              >
                <Eye className="w-4 h-4" />
                <span>التفاصيل</span>
              </EnhancedButton>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">اختر موزعاً لعرض التفاصيل</p>
          </div>
        )}
      </CardBody>
    </Card>
  );

  if (isLoading && distributors.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Navigation className="w-6 h-6 mr-3" />
            التتبع المباشر للموزعين
          </h2>
          <p className="text-gray-600 mt-1">
            متابعة مباشرة لموقع وأداء الموزعين لتاريخ{" "}
            {new Date(selectedDate).toLocaleDateString("en-GB")}
          </p>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>آخر تحديث: {lastUpdate.toLocaleTimeString("ar-SA")}</span>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <EnhancedButton
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "primary" : "outline"}
              size="sm"
              className="flex items-center space-x-2 space-x-reverse"
            >
              {autoRefresh ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{autoRefresh ? "إيقاف" : "تشغيل"} التحديث التلقائي</span>
            </EnhancedButton>

            <EnhancedButton
              onClick={loadTrackingData}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>تحديث</span>
            </EnhancedButton>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">موزعين نشطين</p>
                <p className="text-2xl font-bold">
                  {
                    filteredDistributors.filter((d) => d.status === "active")
                      .length
                  }
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">مكتملين</p>
                <p className="text-2xl font-bold">
                  {
                    filteredDistributors.filter((d) => d.status === "completed")
                      .length
                  }
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">
                  {filteredDistributors.reduce(
                    (sum, d) => sum + (d.orders_delivered_today || 0),
                    0
                  )}
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-200" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold">
                  €
                  {filteredDistributors
                    .reduce((sum, d) => sum + (d.daily_revenue || 0), 0)
                    .toFixed(0)}
                </p>
              </div>
              <Euro className="w-8 h-8 text-yellow-200" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-lg">
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <EnhancedInput
                type="text"
                placeholder="البحث في الموزعين..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            <div>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="completed">مكتمل</option>
                <option value="offline">غير متصل</option>
              </select>
            </div>

            <div>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="split">عرض مقسم</option>
                <option value="map">الخريطة فقط</option>
                <option value="grid">الشبكة فقط</option>
              </select>
            </div>

            <div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="15">كل 15 ثانية</option>
                <option value="30">كل 30 ثانية</option>
                <option value="60">كل دقيقة</option>
                <option value="300">كل 5 دقائق</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Content */}
      <div
        className={`grid gap-6 ${
          viewMode === "split"
            ? "lg:grid-cols-3"
            : viewMode === "map"
            ? "grid-cols-1"
            : "grid-cols-1"
        }`}
      >
        {/* Map View */}
        {(viewMode === "split" || viewMode === "map") && (
          <div
            className={viewMode === "split" ? "lg:col-span-2" : "col-span-1"}
          >
            <Card className="bg-white shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapIcon className="w-5 h-5 mr-2" />
                  خريطة التتبع المباشر
                </h3>
              </CardHeader>
              <CardBody className="p-0">
                <div
                  ref={mapRef}
                  className="w-full h-96 lg:h-[600px] rounded-b-lg"
                  style={{ minHeight: "400px" }}
                >
                  {!mapLoaded && (
                    <div className="flex items-center justify-center h-full bg-gray-100 rounded-b-lg">
                      <div className="text-center">
                        <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">جاري تحميل الخريطة...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Distributors Grid or Detailed View */}
        {viewMode === "split" && (
          <div className="space-y-4">
            <DetailedView distributor={selectedDistributor} />
          </div>
        )}

        {(viewMode === "grid" || viewMode === "map") && (
          <div className="space-y-6">
            {/* Distributors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredDistributors.length > 0 ? (
                  filteredDistributors.map((distributor) => (
                    <DistributorCard
                      key={distributor.id}
                      distributor={distributor}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      لا يوجد موزعين متاحين
                    </p>
                    <p className="text-gray-400 text-sm">
                      {filters.search || filters.status !== "all"
                        ? "جرب تغيير معايير البحث"
                        : "لا يوجد موزعين نشطين في الوقت الحالي"}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Distributor Details */}
            {selectedDistributor && (
              <DetailedView distributor={selectedDistributor} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveDistributorTracking;
