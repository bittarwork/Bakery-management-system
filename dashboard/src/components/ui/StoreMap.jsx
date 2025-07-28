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

  // Add markers for Google Maps
  const addGoogleMarkers = (mapInstance) => {
    if (!window.google || !window.google.maps || !stores.length) return;

    stores.forEach((store) => {
      if (!store.latitude || !store.longitude) return;

      const position = {
        lat: parseFloat(store.latitude),
        lng: parseFloat(store.longitude),
      };

      const marker = new window.google.maps.Marker({
        position: position,
        map: mapInstance,
        title: store.name,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#EF4444" stroke="#ffffff" stroke-width="2"/>
              <circle cx="16" cy="16" r="6" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16),
        },
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${
              store.name
            }</h3>
            ${
              store.owner_name
                ? `<p style="margin: 4px 0; color: #6b7280;"><strong>المالك:</strong> ${store.owner_name}</p>`
                : ""
            }
            ${
              store.phone
                ? `<p style="margin: 4px 0; color: #6b7280;"><strong>الهاتف:</strong> ${store.phone}</p>`
                : ""
            }
            ${
              store.address
                ? `<p style="margin: 4px 0; color: #6b7280;"><strong>العنوان:</strong> ${store.address}</p>`
                : ""
            }
            ${
              store.category
                ? `<p style="margin: 4px 0; color: #6b7280;"><strong>الفئة:</strong> ${store.category}</p>`
                : ""
            }
          </div>
        `,
      });

      marker.addListener("click", () => {
        // Close any open info window
        if (window.currentInfoWindow) {
          window.currentInfoWindow.close();
        }

        infoWindow.open(mapInstance, marker);
        window.currentInfoWindow = infoWindow;

        // Call onLocationSelect if provided
        if (onLocationSelect) {
          onLocationSelect({
            lat: position.lat,
            lng: position.lng,
            name: store.name,
            store: store,
          });
        }
      });
    });
  };

  // Add markers for Leaflet Maps
  const addLeafletMarkers = (mapInstance) => {
    if (!window.L || !stores.length) return;

    const L = window.L;

    stores.forEach((store) => {
      if (!store.latitude || !store.longitude) return;

      const position = [
        parseFloat(store.latitude),
        parseFloat(store.longitude),
      ];

      const marker = L.marker(position, {
        icon: L.divIcon({
          className: "store-marker",
          html: `
            <div style="
              width: 32px; 
              height: 32px; 
              background: #EF4444; 
              border: 2px solid white; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              <div style="
                width: 12px; 
                height: 12px; 
                background: white; 
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        }),
      }).addTo(mapInstance);

      // Add popup
      const popupContent = `
        <div style="padding: 8px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${
            store.name
          }</h3>
          ${
            store.owner_name
              ? `<p style="margin: 4px 0; color: #6b7280;"><strong>المالك:</strong> ${store.owner_name}</p>`
              : ""
          }
          ${
            store.phone
              ? `<p style="margin: 4px 0; color: #6b7280;"><strong>الهاتف:</strong> ${store.phone}</p>`
              : ""
          }
          ${
            store.address
              ? `<p style="margin: 4px 0; color: #6b7280;"><strong>العنوان:</strong> ${store.address}</p>`
              : ""
          }
          ${
            store.category
              ? `<p style="margin: 4px 0; color: #6b7280;"><strong>الفئة:</strong> ${store.category}</p>`
              : ""
          }
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        // Call onLocationSelect if provided
        if (onLocationSelect) {
          onLocationSelect({
            lat: position[0],
            lng: position[1],
            name: store.name,
            store: store,
          });
        }
      });
    });
  };

  // Add current location marker
  const addCurrentLocationMarker = (mapInstance, location) => {
    if (!location) return;

    if (mapProvider === "google" && window.google && window.google.maps) {
      // Remove existing current location marker
      if (window.currentLocationMarker) {
        window.currentLocationMarker.setMap(null);
      }

      const currentLocationMarker = new window.google.maps.Marker({
        position: location,
        map: mapInstance,
        title: "موقعك الحالي",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#10B981" stroke="#ffffff" stroke-width="4"/>
              <circle cx="20" cy="20" r="10" fill="#ffffff"/>
              <circle cx="20" cy="20" r="4" fill="#10B981"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
        zIndex: 1000,
      });

      window.currentLocationMarker = currentLocationMarker;

      // Add info window for current location
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">موقعك الحالي</h3>
            <p style="margin: 4px 0; color: #6b7280;">دقة التحديد: ${Math.round(
              location.accuracy || 0
            )} متر</p>
          </div>
        `,
      });

      currentLocationMarker.addListener("click", () => {
        infoWindow.open(mapInstance, currentLocationMarker);
      });
    } else if (window.L) {
      // Remove existing current location marker
      if (window.currentLocationMarker && mapInstance.removeLayer) {
        mapInstance.removeLayer(window.currentLocationMarker);
      }

      const L = window.L;
      const currentLocationMarker = L.marker([location.lat, location.lng], {
        icon: L.divIcon({
          className: "current-location-marker",
          html: `
            <div style="
              width: 40px; 
              height: 40px; 
              background: #10B981; 
              border: 4px solid white; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            ">
              <div style="
                width: 20px; 
                height: 20px; 
                background: white; 
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  width: 8px; 
                  height: 8px; 
                  background: #10B981; 
                  border-radius: 50%;
                "></div>
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        }),
      }).addTo(mapInstance);

      window.currentLocationMarker = currentLocationMarker;

      // Add popup
      const popupContent = `
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">موقعك الحالي</h3>
          <p style="margin: 4px 0; color: #6b7280;">دقة التحديد: ${Math.round(
            location.accuracy || 0
          )} متر</p>
        </div>
      `;

      currentLocationMarker.bindPopup(popupContent);
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    setCurrentLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("المتصفح لا يدعم تحديد الموقع");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
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
          name: "الموقع الحالي",
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setError("خطأ في تحديد الموقع الحالي");
    } finally {
      setCurrentLocationLoading(false);
    }
  };

  // Load Google Maps API
  const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      // Remove existing script if any
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&loading=async`;
      script.onload = () => {
        if (window.google && window.google.maps) {
          resolve();
        } else {
          reject(new Error("Failed to load Google Maps API"));
        }
      };
      script.onerror = (error) => {
        console.error("Error loading Google Maps API:", error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  };

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapRef.current || !isMounted) return;

      try {
        // Clean up existing map
        if (mapInstanceRef.current) {
          // Clear existing map
          mapInstanceRef.current = null;
        }

        // Clear any existing content
        if (mapRef.current) {
          mapRef.current.innerHTML = "";
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
          setError("فشل في تحميل الخريطة. يرجى التحقق من الاتصال بالإنترنت.");
          setIsLoading(false);
        }
      }
    };

    const initGoogleMap = async () => {
      try {
        // Load Google Maps API if not already loaded
        if (!window.google || !window.google.maps) {
          await loadGoogleMapsAPI();
        }

        // Wait a bit more to ensure API is fully loaded
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (!window.google || !window.google.maps) {
          throw new Error("Google Maps API failed to load properly");
        }

        // Default center (Belgium/Brussels area for bakery context)
        const defaultCenter = center ||
          userLocation || { lat: 50.8503, lng: 4.3517 };

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
              stylers: [{ visibility: "on" }],
            },
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "on" }],
            },
          ],
        });

        mapInstanceRef.current = mapInstance;

        // Wait for map to be ready
        await new Promise((resolve) => {
          window.google.maps.event.addListenerOnce(
            mapInstance,
            "idle",
            resolve
          );
        });

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
      } catch (error) {
        console.error("Error initializing Google Map:", error);
        // Fallback to Leaflet if Google Maps fails
        await initLeafletMap();
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
      if (mapCenter && typeof mapCenter === "object" && mapCenter.lat) {
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

      // Clean up current location marker
      if (window.currentLocationMarker) {
        try {
          if (mapProvider === "google") {
            window.currentLocationMarker.setMap(null);
          } else if (
            mapInstanceRef.current &&
            mapInstanceRef.current.removeLayer
          ) {
            mapInstanceRef.current.removeLayer(window.currentLocationMarker);
          }
        } catch (e) {
          console.log("Current location marker cleanup error:", e.message);
        }
        window.currentLocationMarker = null;
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
        zIndex: 999,
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
