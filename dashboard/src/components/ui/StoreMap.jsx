import React, { useEffect, useRef, useState } from "react";
import { MapPin, Info, Navigation, Target } from "lucide-react";
import config from "../../config/config";

const StoreMap = ({
  stores = [],
  onLocationSelect,
  selectedLocation = null,
  height = "400px",
  showControls = true,
  interactive = true,
  center = null,
  zoom = 12,
  mapProvider = "google", // Default to Google Maps
  enableCurrentLocation = false,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Use Google Maps API key from config
  const googleMapsApiKey = config.GOOGLE_MAPS_API_KEY;

  // Get current location
  const getCurrentLocation = async () => {
    setCurrentLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('المتصفح لا يدعم تحديد الموقع');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      setUserLocation(location);

      // Center map on user location
      if (mapInstanceRef.current) {
        if (mapProvider === "google") {
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(15);
        } else {
          mapInstanceRef.current.setView([location.lat, location.lng], 15);
        }
      }

      // Call onLocationSelect if provided
      if (onLocationSelect) {
        onLocationSelect({
          ...location,
          name: "الموقع الحالي"
        });
      }

    } catch (error) {
      console.error('Error getting location:', error);
      setError('خطأ في تحديد الموقع الحالي');
    } finally {
      setCurrentLocationLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Clean up existing map more thoroughly
        if (mapInstanceRef.current) {
          if (mapProvider === "google") {
            // Google Maps cleanup
            mapInstanceRef.current = null;
          } else {
            // Leaflet cleanup
            try {
              if (mapInstanceRef.current.remove) {
                mapInstanceRef.current.remove();
              }
            } catch (e) {
              console.log("Map cleanup error:", e.message);
            }
            mapInstanceRef.current = null;
          }
        }

        // Clear container completely
        if (mapRef.current) {
          mapRef.current.innerHTML = "";
          // Remove any existing map-related attributes
          mapRef.current.removeAttribute("data-leaflet-map");
          mapRef.current.className = mapRef.current.className.replace(
            /leaflet-container.*?(\s|$)/g,
            ""
          );
          // Clean up Leaflet specific properties
          delete mapRef.current._leaflet_id;
          delete mapRef.current._leaflet_map;
        }

        // Small delay to ensure cleanup is complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!isMounted) return;

        // Initialize based on provider and API key availability
        if (mapProvider === "google" && googleMapsApiKey) {
          await initGoogleMap();
        } else {
          await initLeafletMap();
        }

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error initializing map:", err);
        if (isMounted) {
          setError(
            "فشل في تحميل الخريطة. يرجى التحقق من الاتصال بالإنترنت."
          );
          setIsLoading(false);
        }
      }
    };

    const initGoogleMap = async () => {
      // Load Google Maps API if not already loaded
      if (!window.google || !window.google.maps) {
        await loadGoogleMapsAPI();
      }

      // Default center (Belgium/Brussels area for bakery context)
      const defaultCenter = center || userLocation || { lat: 50.8503, lng: 4.3517 };

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: showControls,
        streetViewControl: showControls,
        fullscreenControl: showControls,
        zoomControl: showControls,
        // Improved styling for better UX
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
      });

      mapInstanceRef.current = mapInstance;

      // Add markers for stores
      addGoogleMarkers(mapInstance);

      // Add click listener if interactive
      if (interactive && onLocationSelect) {
        mapInstance.addListener("click", (event) => {
          const position = event.latLng;
          onLocationSelect({
            lat: position.lat(),
            lng: position.lng(),
            name: "موقع محدد",
          });
        });
      }

      // Add current location marker if available
      if (userLocation) {
        addCurrentLocationMarker(mapInstance, userLocation);
      }
    };

    const initLeafletMap = async () => {
      // Load Leaflet
      const L = await import("leaflet");

      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Wait for CSS to load
        await new Promise((resolve) => {
          link.onload = resolve;
          setTimeout(resolve, 100);
        });
      }

      // Ensure container is ready
      if (!mapRef.current) {
        throw new Error("Map container not available");
      }

      // Properly clean up existing Leaflet instance
      if (mapRef.current._leaflet_id) {
        // Remove existing map instance
        const existingMap = mapRef.current._leaflet_map;
        if (existingMap) {
          existingMap.remove();
        }
        // Clear the container
        mapRef.current.innerHTML = "";
        delete mapRef.current._leaflet_id;
        delete mapRef.current._leaflet_map;
      }

      // Get user location first, then fall back to center or default
      let mapCenter = center || userLocation || [50.8503, 4.3517]; // Default to Brussels

      // Convert object to array for Leaflet
      if (mapCenter && typeof mapCenter === 'object' && mapCenter.lat) {
        mapCenter = [mapCenter.lat, mapCenter.lng];
      }

      try {
        const mapInstance = L.map(mapRef.current, {
          center: mapCenter,
          zoom: zoom,
          zoomControl: showControls,
          attributionControl: false,
        });

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstance);

        // Store reference to map instance
        mapRef.current._leaflet_map = mapInstance;
        mapInstanceRef.current = mapInstance;

        // Add markers
        addLeafletMarkers(mapInstance);

        // Add click listener if interactive
        if (interactive && onLocationSelect) {
          mapInstance.on("click", (e) => {
            const position = e.latlng;
            onLocationSelect({
              lat: position.lat,
              lng: position.lng,
              name: "موقع محدد",
            });
          });
        }
      } catch (error) {
        console.error("Error creating Leaflet map:", error);
        throw error;
      }
    };

    const loadGoogleMapsAPI = () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const addCurrentLocationMarker = (mapInstance, location) => {
      if (!mapInstance || !window.google) return;

      new window.google.maps.Marker({
        position: location,
        map: mapInstance,
        title: "موقعك الحالي",
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12),
        },
        zIndex: 1000
      });
    };

    const addGoogleMarkers = (mapInstance) => {
      if (!mapInstance || !window.google) return;

      const bounds = new window.google.maps.LatLngBounds();
      let hasValidStores = false;

      stores.forEach((store) => {
        // Handle different coordinate field names
        const lat = store.gps_coordinates?.latitude || store.latitude;
        const lng = store.gps_coordinates?.longitude || store.longitude;
        
        if (!lat || !lng) return;

        const position = {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        };

        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          title: store.name,
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4C11.6 4 8 7.6 8 12c0 8 8 16 8 16s8-8 8-16c0-4.4-3.6-8-8-8z" fill="#FF6B6B" stroke="#ffffff" stroke-width="2"/>
                <circle cx="16" cy="12" r="3" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32),
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 250px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #333; font-size: 16px;">${store.name}</h3>
              ${store.address ? `<p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>العنوان:</strong> ${store.address}</p>` : ""}
              ${store.phone ? `<p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>الهاتف:</strong> ${store.phone}</p>` : ""}
              ${store.category ? `<p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>الفئة:</strong> ${store.category}</p>` : ""}
              <p style="margin: 4px 0; font-size: 14px;"><strong>الحالة:</strong> 
                <span style="color: ${store.status === "active" ? "#10B981" : "#EF4444"}; font-weight: bold;">
                  ${store.status === "active" ? "نشط" : "غير نشط"}
                </span>
              </p>
              ${store.total_orders ? `<p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>إجمالي الطلبات:</strong> ${store.total_orders}</p>` : ""}
            </div>
          `,
        });

        marker.addListener("click", () => {
          // Close any open info windows
          if (window.currentInfoWindow) {
            window.currentInfoWindow.close();
          }
          infoWindow.open(mapInstance, marker);
          window.currentInfoWindow = infoWindow;
        });

        bounds.extend(position);
        hasValidStores = true;
      });

      // Fit bounds if multiple stores
      if (hasValidStores && stores.length > 1) {
        mapInstance.fitBounds(bounds);
        // Ensure zoom doesn't get too high
        const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
          if (mapInstance.getZoom() > 16) {
            mapInstance.setZoom(16);
          }
          window.google.maps.event.removeListener(listener);
        });
      }
    };

    const addLeafletMarkers = (mapInstance) => {
      if (!mapInstance || !window.L) return;

      const L = window.L;
      const markers = [];

      stores.forEach((store) => {
        // Handle different coordinate field names
        const lat = store.gps_coordinates?.latitude || store.latitude;
        const lng = store.gps_coordinates?.longitude || store.longitude;
        
        if (!lat || !lng) return;

        const position = [parseFloat(lat), parseFloat(lng)];

        const marker = L.marker(position).addTo(mapInstance);

        const popupContent = `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${store.name}</h3>
            ${store.address ? `<p style="margin: 4px 0;"><strong>العنوان:</strong> ${store.address}</p>` : ""}
            ${store.phone ? `<p style="margin: 4px 0;"><strong>الهاتف:</strong> ${store.phone}</p>` : ""}
            <p style="margin: 4px 0;"><strong>الحالة:</strong> 
              <span style="color: ${store.status === "active" ? "green" : "red"};">
                ${store.status === "active" ? "نشط" : "غير نشط"}
              </span>
            </p>
          </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);
      });

      // Fit bounds if multiple stores
      if (markers.length > 1) {
        const group = L.featureGroup(markers);
        mapInstance.fitBounds(group.getBounds());
      }
    };

    initMap();

    return () => {
      isMounted = false;

      // More thorough cleanup
      if (mapInstanceRef.current) {
        if (mapProvider === "google") {
          mapInstanceRef.current = null;
        } else {
          try {
            if (mapInstanceRef.current.remove) {
              mapInstanceRef.current.remove();
            }
          } catch (e) {
            console.log("Map cleanup error:", e.message);
          }
          mapInstanceRef.current = null;
        }
      }

      // Clean up container
      if (mapRef.current) {
        mapRef.current.innerHTML = "";
        mapRef.current.removeAttribute("data-leaflet-map");
        mapRef.current.className = mapRef.current.className.replace(
          /leaflet-container.*?(\s|$)/g,
          ""
        );
        // Clean up Leaflet specific properties
        delete mapRef.current._leaflet_id;
        delete mapRef.current._leaflet_map;
      }

      // Clean up global markers
      if (window.selectedMarker) {
        try {
          if (mapProvider === "google") {
            window.selectedMarker.setMap(null);
          } else if (
            mapInstanceRef.current &&
            mapInstanceRef.current.removeLayer
          ) {
            mapInstanceRef.current.removeLayer(window.selectedMarker);
          }
        } catch (e) {
          console.log("Marker cleanup error:", e.message);
        }
        window.selectedMarker = null;
      }

      // Close info window
      if (window.currentInfoWindow) {
        try {
          window.currentInfoWindow.close();
        } catch (e) {
          console.log("Info window cleanup error:", e.message);
        }
        window.currentInfoWindow = null;
      }
    };
  }, [
    mapProvider,
    googleMapsApiKey,
    center,
    zoom,
    showControls,
    interactive,
    onLocationSelect,
    userLocation,
  ]);

  // Handle selected location
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;

    if (mapProvider === "google") {
      // Remove existing selected marker
      if (window.selectedMarker) {
        window.selectedMarker.setMap(null);
      }

      // Add new selected marker
      const selectedMarker = new window.google.maps.Marker({
        position: selectedLocation,
        map: mapInstanceRef.current,
        title: selectedLocation.name || "موقع محدد",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="16" fill="#3B82F6" stroke="#ffffff" stroke-width="3"/>
              <circle cx="20" cy="20" r="8" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
        zIndex: 999
      });

      window.selectedMarker = selectedMarker;
      mapInstanceRef.current.setCenter(selectedLocation);
      if (mapInstanceRef.current.getZoom() < 15) {
        mapInstanceRef.current.setZoom(15);
      }
    } else {
      // Remove existing selected marker
      if (window.selectedMarker) {
        mapInstanceRef.current.removeLayer(window.selectedMarker);
      }

      // Add new selected marker
      const L = window.L;
      if (L) {
        const selectedMarker = L.marker(
          [selectedLocation.lat, selectedLocation.lng],
          {
            icon: L.divIcon({
              className: "selected-marker",
              html: `
              <div style="
                width: 40px; 
                height: 40px; 
                background: #3B82F6; 
                border: 3px solid white; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
              ">
                <div style="
                  width: 16px; 
                  height: 16px; 
                  background: white; 
                  border-radius: 50%;
                "></div>
              </div>
            `,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
            }),
          }
        ).addTo(mapInstanceRef.current);

        window.selectedMarker = selectedMarker;
        mapInstanceRef.current.setView(
          [selectedLocation.lat, selectedLocation.lng],
          Math.max(mapInstanceRef.current.getZoom(), 15)
        );
      }
    }
  }, [selectedLocation, mapProvider]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-600 mb-2">
          <MapPin className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          المحاولة مرة أخرى
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        style={{ height }}
        className="rounded-lg border border-gray-200"
      />

      {/* Map Controls */}
      {interactive && (
        <div className="absolute top-4 left-4 space-y-2">
          {onLocationSelect && (
            <div className="bg-white rounded-lg shadow-lg p-3 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Info className="w-4 h-4" />
                <span>انقر على الخريطة لاختيار الموقع</span>
              </div>
            </div>
          )}

          {enableCurrentLocation && (
            <button
              onClick={getCurrentLocation}
              disabled={currentLocationLoading}
              className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-lg transition-colors flex items-center space-x-2 text-gray-700 disabled:opacity-50"
            >
              {currentLocationLoading ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Target className="w-4 h-4" />
              )}
              <span className="text-sm">
                {currentLocationLoading ? "جاري التحديد..." : "موقعي الحالي"}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Store Count */}
      {stores.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>عدد المتاجر: {stores.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreMap;
