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
}) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Leaflet Map
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically import Leaflet
        const L = await import("leaflet");

        // Import Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          link.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          link.crossOrigin = "";
          document.head.appendChild(link);
        }

        // Default center (can be overridden by props)
        const defaultCenter = center || [33.3152, 44.3661]; // Baghdad coordinates

        // Create map instance
        const mapInstance = L.map(mapRef.current, {
          center: defaultCenter,
          zoom: zoom,
          zoomControl: showControls,
          attributionControl: false,
        });

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstance);

        setMap(mapInstance);
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to load map. Please check your internet connection.");
        setIsLoading(false);
      }
    };

    initMap();
  }, [center, zoom, showControls]);

  // Add markers when stores change
  useEffect(() => {
    if (!map || !stores.length) return;

    // Clear existing markers
    markers.forEach((marker) => map.removeLayer(marker));

    const L = window.L;
    if (!L) return;

    const newMarkers = stores
      .map((store) => {
        if (!store.latitude || !store.longitude) return null;

        const position = [
          parseFloat(store.latitude),
          parseFloat(store.longitude),
        ];

        // Create custom icon
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

        // Create marker
        const marker = L.marker(position, { icon }).addTo(map);

        // Create popup content
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
            ${
              interactive
                ? `
              <div class="mt-3 pt-3 border-t border-gray-200">
                <button 
                  onclick="window.selectStoreLocation(${store.latitude}, ${store.longitude}, '${store.name}')"
                  class="w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Select Location
                </button>
              </div>
            `
                : ""
            }
          </div>
        `;

        marker.bindPopup(popupContent);
        return marker;
      })
      .filter(Boolean);

    setMarkers(newMarkers);

    // Fit bounds if multiple stores
    if (newMarkers.length > 1) {
      const group = L.featureGroup(newMarkers);
      map.fitBounds(group.getBounds());
    } else if (newMarkers.length === 1) {
      map.setView(newMarkers[0].getLatLng(), zoom);
    }
  }, [map, stores, interactive, zoom]);

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
  }, [map, interactive, onLocationSelect]);

  // Show selected location marker
  useEffect(() => {
    if (!map || !selectedLocation) return;

    const L = window.L;
    if (!L) return;

    // Remove previous selected marker
    if (window.selectedMarker) {
      map.removeLayer(window.selectedMarker);
    }

    // Add new selected marker
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
  }, [map, selectedLocation]);

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
