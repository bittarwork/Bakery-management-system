import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import config from "../../config/config";
import Button from "./Button";

const LocationMap = ({ address, onLocationChange, initialLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(
    initialLocation || {
      lat: config.DEFAULT_MAP_CENTER.lat,
      lng: config.DEFAULT_MAP_CENTER.lng,
    }
  );

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => {
      toast.error("Failed to load Google Maps");
      setIsLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize map
  const initializeMap = () => {
    if (!window.google || !mapRef.current) {
      setIsLoading(false);
      return;
    }

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: currentLocation,
        zoom: config.GOOGLE_MAPS_SETTINGS.zoom,
        mapTypeId: config.GOOGLE_MAPS_SETTINGS.mapTypeId,
        zoomControl: config.GOOGLE_MAPS_SETTINGS.zoomControl,
        streetViewControl: config.GOOGLE_MAPS_SETTINGS.streetViewControl,
        fullscreenControl: config.GOOGLE_MAPS_SETTINGS.fullscreenControl,
      });

      mapInstanceRef.current = map;

      // Create marker
      const marker = new window.google.maps.Marker({
        position: currentLocation,
        map: map,
        draggable: true,
        title: "موقعك",
      });

      markerRef.current = marker;

      // Handle marker drag
      marker.addListener("dragend", () => {
        const position = marker.getPosition();
        const newLocation = {
          lat: position.lat(),
          lng: position.lng(),
        };
        setCurrentLocation(newLocation);
        updateAddress(newLocation);
      });

      // Handle map click
      map.addListener("click", (event) => {
        const newLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        marker.setPosition(newLocation);
        setCurrentLocation(newLocation);
        updateAddress(newLocation);
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("حدث خطأ في تحميل الخريطة");
      setIsLoading(false);
    }
  };

  // Update address from coordinates
  const updateAddress = (location) => {
    if (!window.google || !window.google.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results[0]) {
        const formattedAddress = results[0].formatted_address;
        onLocationChange({
          address: formattedAddress,
          lat: location.lat,
          lng: location.lng,
        });
      }
    });
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCurrentLocation(newLocation);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setCenter(newLocation);
          markerRef.current.setPosition(newLocation);
        }

        updateAddress(newLocation);
        setLoadingLocation(false);
        toast.success("تم تحديد موقعك الحالي");
      },
      (error) => {
        console.error("Error getting location:", error);
        let errorMessage = "حدث خطأ في تحديد الموقع";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "تم رفض الوصول للموقع";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "الموقع غير متاح";
            break;
          case error.TIMEOUT:
            errorMessage = "انتهت مهلة تحديد الموقع";
            break;
        }

        toast.error(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 rounded-lg border border-gray-300 bg-gray-100"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="flex items-center space-x-2">
              <Loader className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-gray-600">جاري تحميل الخريطة...</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            انقر على الخريطة أو اسحب العلامة لتحديد الموقع
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Navigation className="w-4 h-4" />}
          onClick={getCurrentLocation}
          loading={loadingLocation}
          disabled={loadingLocation || isLoading}
        >
          {loadingLocation ? "جاري التحديد..." : "موقعي الحالي"}
        </Button>
      </div>

      {/* Address Display */}
      {address && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <span className="text-sm text-gray-700">{address}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMap;
