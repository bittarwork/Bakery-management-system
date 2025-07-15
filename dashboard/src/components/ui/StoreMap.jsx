import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Info } from "lucide-react";

const StoreMap = ({
  stores = [],
  onLocationSelect,
  selectedLocation = null,
  height = "400px",
  showControls = true,
  interactive = true,
  center = null,
  zoom = 12,
  mapProvider = "leaflet", // "leaflet" or "google"
  googleMapsApiKey = null,
}) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Map
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if map is already initialized
        if (map) {
          map.remove();
          setMap(null);
        }

        if (mapProvider === "google" && googleMapsApiKey) {
          await initGoogleMap();
        } else {
          await initLeafletMap();
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to load map. Please check your internet connection.");
        setIsLoading(false);
      }
    };

    const initGoogleMap = async () => {
      // Load Google Maps API
      if (!window.google || !window.google.maps) {
        await loadGoogleMapsAPI();
      }

      const defaultCenter = center || { lat: 33.3152, lng: 44.3661 };

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: showControls,
        streetViewControl: showControls,
        fullscreenControl: showControls,
        zoomControl: showControls,
      });

      setMap(mapInstance);
    };

    const initLeafletMap = async () => {
      const L = await import("leaflet");

      // Import Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      const defaultCenter = center || [33.3152, 44.3661];

      const mapInstance = L.map(mapRef.current, {
        center: defaultCenter,
        zoom: zoom,
        zoomControl: showControls,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance);

      setMap(mapInstance);
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

    initMap();

    // Cleanup function
    return () => {
      if (map) {
        if (mapProvider === "google") {
          // Google Maps doesn't need explicit cleanup
        } else {
          map.remove();
        }
        setMap(null);
      }
    };
  }, [center, zoom, showControls, mapProvider, googleMapsApiKey]);

  // Add markers when stores change
  useEffect(() => {
    if (!map || !stores.length) return;

    // Clear existing markers
    if (mapProvider === "google") {
      markers.forEach((marker) => marker.setMap(null));
    } else {
      markers.forEach((marker) => map.removeLayer(marker));
    }

    if (mapProvider === "google") {
      addGoogleMarkers();
    } else {
      addLeafletMarkers();
    }
  }, [map, stores, interactive, zoom, mapProvider]);

  const addGoogleMarkers = () => {
    const newMarkers = stores
      .map((store) => {
        if (!store.latitude || !store.longitude) return null;

        const position = {
          lat: parseFloat(store.latitude),
          lng: parseFloat(store.longitude),
        };

        const marker = new window.google.maps.Marker({
          position,
          map,
          title: store.name,
          icon: {
            url:
              store.status === "active"
                ? "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
                    <path d="M12 16l3 3 5-5" stroke="#ffffff" stroke-width="2" fill="none"/>
                  </svg>
                `)
                : "data:image/svg+xml;charset=UTF-8," +
                  encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#EF4444" stroke="#ffffff" stroke-width="2"/>
                    <path d="M12 12l8 8m0-8l-8 8" stroke="#ffffff" stroke-width="2"/>
                  </svg>
                `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16),
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-xs">
              <h3 class="font-semibold text-gray-900 mb-2">${store.name}</h3>
              <div class="space-y-1 text-sm text-gray-600">
                ${
                  store.address
                    ? `<p><strong>Address:</strong> ${store.address}</p>`
                    : ""
                }
                ${
                  store.phone
                    ? `<p><strong>Phone:</strong> ${store.phone}</p>`
                    : ""
                }
                ${
                  store.email
                    ? `<p><strong>Email:</strong> ${store.email}</p>`
                    : ""
                }
                <p><strong>Status:</strong> 
                  <span class="${
                    store.status === "active"
                      ? "text-green-600"
                      : "text-red-600"
                  }">
                    ${store.status === "active" ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        return marker;
      })
      .filter(Boolean);

    setMarkers(newMarkers);

    if (newMarkers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach((marker) => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    } else if (newMarkers.length === 1) {
      map.setCenter(newMarkers[0].getPosition());
    }
  };

  const addLeafletMarkers = () => {
    const L = window.L;
    if (!L) return;

    const newMarkers = stores
      .map((store) => {
        if (!store.latitude || !store.longitude) return null;

        const position = [
          parseFloat(store.latitude),
          parseFloat(store.longitude),
        ];

        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: 32px; 
              height: 32px; 
              background: ${store.status === "active" ? "#10B981" : "#EF4444"}; 
              border: 2px solid white; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const marker = L.marker(position, { icon }).addTo(map);

        const popupContent = `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-gray-900 mb-2">${store.name}</h3>
            <div class="space-y-1 text-sm text-gray-600">
              ${
                store.address
                  ? `<p><strong>Address:</strong> ${store.address}</p>`
                  : ""
              }
              ${
                store.phone
                  ? `<p><strong>Phone:</strong> ${store.phone}</p>`
                  : ""
              }
              ${
                store.email
                  ? `<p><strong>Email:</strong> ${store.email}</p>`
                  : ""
              }
              <p><strong>Status:</strong> 
                <span class="${
                  store.status === "active" ? "text-green-600" : "text-red-600"
                }">
                  ${store.status === "active" ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        return marker;
      })
      .filter(Boolean);

    setMarkers(newMarkers);

    if (newMarkers.length > 1) {
      const group = L.featureGroup(newMarkers);
      map.fitBounds(group.getBounds());
    } else if (newMarkers.length === 1) {
      map.setView(newMarkers[0].getLatLng(), zoom);
    }
  };

  // Handle location selection
  useEffect(() => {
    if (onLocationSelect) {
      window.selectStoreLocation = (lat, lng, name) => {
        onLocationSelect({ lat: parseFloat(lat), lng: parseFloat(lng), name });
      };
    }
  }, [onLocationSelect]);

  // Handle map click for location picking
  useEffect(() => {
    if (!map || !interactive || !onLocationSelect) return;

    if (mapProvider === "google") {
      const clickListener = map.addListener("click", (event) => {
        const position = event.latLng;
        onLocationSelect({
          lat: position.lat(),
          lng: position.lng(),
          name: "Selected Location",
        });
      });

      return () => {
        window.google.maps.event.removeListener(clickListener);
      };
    } else {
      const clickHandler = (e) => {
        const position = e.latlng;
        onLocationSelect({
          lat: position.lat,
          lng: position.lng,
          name: "Selected Location",
        });
      };

      map.on("click", clickHandler);

      return () => {
        map.off("click", clickHandler);
      };
    }
  }, [map, interactive, onLocationSelect, mapProvider]);

  // Show selected location marker
  useEffect(() => {
    if (!map || !selectedLocation) return;

    if (mapProvider === "google") {
      if (window.selectedMarker) {
        window.selectedMarker.setMap(null);
      }

      const selectedMarker = new window.google.maps.Marker({
        position: selectedLocation,
        map,
        title: "Selected Location",
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
        zIndex: 1000,
      });

      window.selectedMarker = selectedMarker;
      map.setCenter(selectedLocation);
      map.setZoom(15);
    } else {
      const L = window.L;
      if (!L) return;

      if (window.selectedMarker) {
        map.removeLayer(window.selectedMarker);
      }

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
          zIndexOffset: 1000,
        }
      ).addTo(map);

      window.selectedMarker = selectedMarker;
      map.setView([selectedLocation.lat, selectedLocation.lng], 15);
    }
  }, [map, selectedLocation, mapProvider]);

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
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div
        ref={mapRef}
        style={{ height }}
        className="rounded-lg border border-gray-200"
      />

      {interactive && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Info className="w-4 h-4" />
            <span>Click on map to select location</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreMap;
