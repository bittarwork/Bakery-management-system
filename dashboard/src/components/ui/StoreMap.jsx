import React, { useEffect, useRef, useState } from "react";
import { MapPin, Info } from "lucide-react";

const StoreMap = ({
  stores = [],
  onLocationSelect,
  selectedLocation = null,
  height = "400px",
  showControls = true,
  interactive = true,
  center = null,
  zoom = 12,
  mapProvider = "leaflet",
  googleMapsApiKey = null,
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Clean up existing map
        if (mapInstanceRef.current) {
          if (mapProvider === "google") {
            // Google Maps cleanup
            mapInstanceRef.current = null;
          } else {
            // Leaflet cleanup
            try {
              mapInstanceRef.current.remove();
            } catch (e) {
              console.log("Map already removed");
            }
            mapInstanceRef.current = null;
          }
        }

        // Clear container
        if (mapRef.current) {
          mapRef.current.innerHTML = "";
        }

        if (!isMounted) return;

        // Initialize based on provider
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
            "Failed to load map. Please check your internet connection."
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

      mapInstanceRef.current = mapInstance;

      // Add markers
      addGoogleMarkers(mapInstance);

      // Add click listener if interactive
      if (interactive && onLocationSelect) {
        mapInstance.addListener("click", (event) => {
          const position = event.latLng;
          onLocationSelect({
            lat: position.lat(),
            lng: position.lng(),
            name: "Selected Location",
          });
        });
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

      const defaultCenter = center || [33.3152, 44.3661];

      const mapInstance = L.map(mapRef.current, {
        center: defaultCenter,
        zoom: zoom,
        zoomControl: showControls,
        attributionControl: false,
      });

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance);

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
            name: "Selected Location",
          });
        });
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

    const addGoogleMarkers = (mapInstance) => {
      if (!mapInstance || !window.google) return;

      stores.forEach((store) => {
        if (!store.latitude || !store.longitude) return;

        const position = {
          lat: parseFloat(store.latitude),
          lng: parseFloat(store.longitude),
        };

        const marker = new window.google.maps.Marker({
          position,
          map: mapInstance,
          title: store.name,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold;">${
                store.name
              }</h3>
              ${
                store.address
                  ? `<p style="margin: 4px 0;"><strong>Address:</strong> ${store.address}</p>`
                  : ""
              }
              ${
                store.phone
                  ? `<p style="margin: 4px 0;"><strong>Phone:</strong> ${store.phone}</p>`
                  : ""
              }
              <p style="margin: 4px 0;"><strong>Status:</strong> 
                <span style="color: ${
                  store.status === "active" ? "green" : "red"
                };">
                  ${store.status === "active" ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstance, marker);
        });
      });

      // Fit bounds if multiple stores
      if (stores.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        stores.forEach((store) => {
          if (store.latitude && store.longitude) {
            bounds.extend({
              lat: parseFloat(store.latitude),
              lng: parseFloat(store.longitude),
            });
          }
        });
        mapInstance.fitBounds(bounds);
      }
    };

    const addLeafletMarkers = (mapInstance) => {
      if (!mapInstance || !window.L) return;

      const L = window.L;
      const markers = [];

      stores.forEach((store) => {
        if (!store.latitude || !store.longitude) return;

        const position = [
          parseFloat(store.latitude),
          parseFloat(store.longitude),
        ];

        const marker = L.marker(position).addTo(mapInstance);

        const popupContent = `
          <div style="padding: 10px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${store.name}</h3>
            ${
              store.address
                ? `<p style="margin: 4px 0;"><strong>Address:</strong> ${store.address}</p>`
                : ""
            }
            ${
              store.phone
                ? `<p style="margin: 4px 0;"><strong>Phone:</strong> ${store.phone}</p>`
                : ""
            }
            <p style="margin: 4px 0;"><strong>Status:</strong> 
              <span style="color: ${
                store.status === "active" ? "green" : "red"
              };">
                ${store.status === "active" ? "Active" : "Inactive"}
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
      if (mapInstanceRef.current) {
        if (mapProvider === "google") {
          mapInstanceRef.current = null;
        } else {
          try {
            mapInstanceRef.current.remove();
          } catch (e) {
            console.log("Map cleanup error:", e);
          }
          mapInstanceRef.current = null;
        }
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
      });

      window.selectedMarker = selectedMarker;
      mapInstanceRef.current.setCenter(selectedLocation);
      mapInstanceRef.current.setZoom(15);
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
          15
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

      {interactive && onLocationSelect && (
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
