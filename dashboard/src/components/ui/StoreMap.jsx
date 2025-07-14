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
  const [infoWindow, setInfoWindow] = useState(null);
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if Google Maps is loaded
        if (!window.google || !window.google.maps) {
          throw new Error("Google Maps API not loaded");
        }

        // Default center (can be overridden by props)
        const defaultCenter = center || { lat: 33.3152, lng: 44.3661 }; // Baghdad coordinates

        // Create map instance
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: zoom,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: showControls,
          streetViewControl: showControls,
          fullscreenControl: showControls,
          zoomControl: showControls,
          styles: [
            {
              featureType: "poi.business",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        setMap(mapInstance);

        // Create info window
        const infoWindowInstance = new window.google.maps.InfoWindow();
        setInfoWindow(infoWindowInstance);

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
    markers.forEach((marker) => marker.setMap(null));

    const newMarkers = stores
      .map((store) => {
        if (!store.latitude || !store.longitude) return null;

        const position = {
          lat: parseFloat(store.latitude),
          lng: parseFloat(store.longitude),
        };

        // Create marker
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

        // Create info window content
        const infoContent = `
                <div class="p-3 max-w-xs">
                    <h3 class="font-semibold text-gray-900 mb-2">${
                      store.name
                    }</h3>
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
                                ${
                                  store.status === "active"
                                    ? "Active"
                                    : "Inactive"
                                }
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

        // Add click listener
        marker.addListener("click", () => {
          infoWindow.setContent(infoContent);
          infoWindow.open(map, marker);
        });

        return marker;
      })
      .filter(Boolean);

    setMarkers(newMarkers);

    // Fit bounds if multiple stores
    if (newMarkers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach((marker) => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
    } else if (newMarkers.length === 1) {
      map.setCenter(newMarkers[0].getPosition());
    }
  }, [map, stores, interactive]);

  // Handle location selection
  useEffect(() => {
    if (onLocationSelect) {
      window.selectStoreLocation = (lat, lng, name) => {
        onLocationSelect({ lat: parseFloat(lat), lng: parseFloat(lng), name });
        if (infoWindow) {
          infoWindow.close();
        }
      };
    }
  }, [onLocationSelect, infoWindow]);

  // Handle map click for location picking
  useEffect(() => {
    if (!map || !interactive || !onLocationSelect) return;

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
  }, [map, interactive, onLocationSelect]);

  // Show selected location marker
  useEffect(() => {
    if (!map || !selectedLocation) return;

    // Remove previous selected marker
    if (window.selectedMarker) {
      window.selectedMarker.setMap(null);
    }

    // Add new selected marker
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
