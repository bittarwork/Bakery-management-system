import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Icon, divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPinIcon,
  PhoneIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  getStoresMap,
  getCurrentLocation,
  BELGIUM_CENTER,
  BELGIUM_BOUNDS,
} from "../../services/storesAPI";
import { formatCurrency } from "../../utils/formatters";

// Custom marker icons
const createCustomIcon = (color, isActive) => {
  return divIcon({
    html: `
            <div class="relative">
                <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                  isActive ? "bg-green-500" : "bg-red-500"
                }" style="background-color: ${color}">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                </div>
                ${
                  !isActive
                    ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>'
                    : ""
                }
            </div>
        `,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Map event handler component
const MapEventHandler = ({ onLocationSelect, showLocationSelector }) => {
  useMapEvents({
    click: (e) => {
      if (showLocationSelector && onLocationSelect) {
        onLocationSelect(e.latlng);
      }
    },
  });
  return null;
};

// Component to fit map bounds
const FitBounds = ({ stores }) => {
  const map = useMap();

  useEffect(() => {
    if (stores && stores.length > 0) {
      const bounds = stores.map((store) => [store.latitude, store.longitude]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [stores, map]);

  return null;
};

const StoresMap = ({
  height = "500px",
  showFilters = true,
  showLocationSelector = false,
  onLocationSelect,
  selectedStore = null,
  onStoreSelect,
}) => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    region_id: "",
    is_active: "true",
  });
  const [userLocation, setUserLocation] = useState(null);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const mapRef = useRef();

  // Load stores data
  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await getStoresMap(filters);
      setStores(response.data.stores);
      setError(null);
    } catch (err) {
      console.error("Error loading stores:", err);
      setError("فشل في تحميل المحلات");
    } finally {
      setLoading(false);
    }
  };

  // Get user location
  const handleGetUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setShowUserLocation(true);

      // Center map on user location
      if (mapRef.current) {
        mapRef.current.setView([location.latitude, location.longitude], 13);
      }
    } catch (err) {
      console.error("Error getting location:", err);
      alert("لا يمكن الحصول على موقعك الحالي");
    }
  };

  useEffect(() => {
    loadStores();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getStoreColor = (store) => {
    if (!store.is_active) return "#ef4444"; // red
    if (store.current_balance > 0) return "#f59e0b"; // amber (has debt)
    if (store.recent_orders > 10) return "#10b981"; // emerald (high activity)
    return "#3b82f6"; // blue (normal)
  };

  const getStoreStatusText = (store) => {
    if (!store.is_active) return "غير نشط";
    if (store.current_balance > 0) return "يوجد دين";
    if (store.recent_orders > 10) return "نشط جداً";
    return "نشط";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-red-600">{error}</p>
          <button
            onClick={loadStores}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                المرشحات:
              </span>
            </div>

            <select
              value={filters.is_active}
              onChange={(e) => handleFilterChange("is_active", e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="true">المحلات النشطة</option>
              <option value="false">المحلات غير النشطة</option>
              <option value="all">جميع المحلات</option>
            </select>

            <button
              onClick={handleGetUserLocation}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <MapPinIcon className="h-4 w-4" />
              موقعي
            </button>

            <div className="text-sm text-gray-600">
              المحلات: {stores.length}
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div style={{ height }} className="relative">
        <MapContainer
          center={[BELGIUM_CENTER.lat, BELGIUM_CENTER.lng]}
          zoom={8}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Store markers */}
          {stores.map((store) => (
            <Marker
              key={store.id}
              position={[store.latitude, store.longitude]}
              icon={createCustomIcon(getStoreColor(store), store.is_active)}
              eventHandlers={{
                click: () => onStoreSelect && onStoreSelect(store),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-64">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {store.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        store.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getStoreStatusText(store)}
                    </span>
                  </div>

                  {store.owner_name && (
                    <p className="text-sm text-gray-600 mb-1">
                      المالك: {store.owner_name}
                    </p>
                  )}

                  {store.address && (
                    <p className="text-sm text-gray-600 mb-2 flex items-start gap-1">
                      <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {store.address}
                    </p>
                  )}

                  {store.phone && (
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <PhoneIcon className="h-4 w-4" />
                      {store.phone}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {store.recent_orders}
                      </div>
                      <div className="text-xs text-gray-500">
                        طلبات (30 يوم)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(store.recent_revenue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        إيرادات (30 يوم)
                      </div>
                    </div>
                  </div>

                  {store.current_balance !== 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">الرصيد:</span>
                        <span
                          className={`font-semibold ${
                            store.current_balance > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {formatCurrency(Math.abs(store.current_balance))}
                          {store.current_balance > 0 ? " (دين)" : " (رصيد)"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User location marker */}
          {showUserLocation && userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={divIcon({
                html: `
                                    <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                                `,
                className: "user-location-marker",
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">موقعك الحالي</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Map event handlers */}
          <MapEventHandler
            onLocationSelect={onLocationSelect}
            showLocationSelector={showLocationSelector}
          />

          {/* Fit bounds to stores */}
          <FitBounds stores={stores} />
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border z-1000">
          <h4 className="font-semibold text-sm mb-2">دليل الألوان</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>نشط جداً (10+ طلبات)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>نشط عادي</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span>يوجد دين</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>غير نشط</span>
            </div>
          </div>
        </div>

        {/* Location selector hint */}
        {showLocationSelector && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-1000">
            <p className="text-sm">انقر على الخريطة لتحديد الموقع</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoresMap;
