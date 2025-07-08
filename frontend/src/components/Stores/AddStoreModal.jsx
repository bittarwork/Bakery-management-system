import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import StoresMap from "./StoresMap";
import {
  createStore,
  geocodeAddress,
  reverseGeocode,
  isWithinBelgium,
  BELGIAN_CITIES,
} from "../../services/storesAPI";
import { useToastContext } from "../common";

const AddStoreModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToastContext();
  const [formData, setFormData] = useState({
    name: "",
    owner_name: "",
    phone: "",
    email: "",
    address: "",
    latitude: null,
    longitude: null,
    payment_method: "cash",
    credit_limit: "0",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationMethod, setLocationMethod] = useState("address"); // 'address' or 'map'

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        owner_name: "",
        phone: "",
        email: "",
        address: "",
        latitude: null,
        longitude: null,
        payment_method: "cash",
        credit_limit: "0",
        notes: "",
      });
      setShowMap(false);
      setLocationMethod("address");
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Geocode address
  const handleGeocodeAddress = async () => {
    if (!formData.address.trim()) {
      toast.error("يرجى إدخال العنوان أولاً");
      return;
    }

    setGeocoding(true);
    try {
      const result = await geocodeAddress(formData.address);
      if (result) {
        if (isWithinBelgium(result.latitude, result.longitude)) {
          setFormData((prev) => ({
            ...prev,
            latitude: result.latitude,
            longitude: result.longitude,
            address: result.display_name || prev.address,
          }));
          toast.success("تم العثور على الموقع بنجاح");
        } else {
          toast.error("الموقع خارج حدود بلجيكا");
        }
      } else {
        toast.error("لم يتم العثور على الموقع");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("خطأ في البحث عن الموقع");
    } finally {
      setGeocoding(false);
    }
  };

  // Handle map location selection
  const handleLocationSelect = async (latlng) => {
    if (!isWithinBelgium(latlng.lat, latlng.lng)) {
      toast.error("يرجى اختيار موقع ضمن حدود بلجيكا");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng,
    }));

    // Try to get address from coordinates
    try {
      const result = await reverseGeocode(latlng.lat, latlng.lng);
      if (result && result.address) {
        setFormData((prev) => ({
          ...prev,
          address: result.address,
        }));
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }

    setShowMap(false);
    toast.success("تم تحديد الموقع بنجاح");
  };

  // Quick city selection
  const handleCitySelect = (city) => {
    setFormData((prev) => ({
      ...prev,
      latitude: city.lat,
      longitude: city.lng,
      address: `${city.name}, Belgium`,
    }));
    toast.success(`تم اختيار ${city.name}`);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("اسم المحل مطلوب");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error("يرجى تحديد موقع المحل على الخريطة");
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      credit_limit: parseFloat(formData.credit_limit) || 0,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      // Clean empty strings
      phone: formData.phone?.trim() || null,
      email: formData.email?.trim() || null,
      owner_name: formData.owner_name?.trim() || null,
      notes: formData.notes?.trim() || null,
    };

    setLoading(true);
    try {
      await createStore(submitData);
      toast.success("تم إضافة المحل بنجاح");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating store:", error);
      toast.error(error.response?.data?.message || "فشل في إضافة المحل");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">إضافة محل جديد</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showMap ? (
            // Map view
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  اختر موقع المحل على الخريطة
                </h3>
                <p className="text-gray-600 text-sm">
                  انقر على الخريطة لتحديد الموقع
                </p>
              </div>
              <StoresMap
                height="400px"
                showFilters={false}
                showLocationSelector={true}
                onLocationSelect={handleLocationSelect}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowMap(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            // Form view
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المحل *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أدخل اسم المحل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المالك
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أدخل اسم المالك"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+32 xxx xxx xxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموقع *
                </label>

                {/* Location method tabs */}
                <div className="flex mb-4 border-b">
                  <button
                    type="button"
                    onClick={() => setLocationMethod("address")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${
                      locationMethod === "address"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    بالعنوان
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMethod("map")}
                    className={`px-4 py-2 text-sm font-medium border-b-2 ${
                      locationMethod === "map"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    بالخريطة
                  </button>
                </div>

                {locationMethod === "address" ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="أدخل عنوان المحل"
                      />
                      <button
                        type="button"
                        onClick={handleGeocodeAddress}
                        disabled={geocoding}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {geocoding ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <MagnifyingGlassIcon className="h-4 w-4" />
                        )}
                        بحث
                      </button>
                    </div>

                    {/* Quick city selection */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        أو اختر مدينة:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {BELGIAN_CITIES.slice(0, 10).map((city) => (
                          <button
                            key={city.name}
                            type="button"
                            onClick={() => handleCitySelect(city)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-center"
                          >
                            {city.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                    >
                      <MapPinIcon className="h-5 w-5" />
                      انقر لفتح الخريطة وتحديد الموقع
                    </button>
                  </div>
                )}

                {/* Location status */}
                {formData.latitude && formData.longitude && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        تم تحديد الموقع
                      </span>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {formData.latitude.toFixed(6)},{" "}
                      {formData.longitude.toFixed(6)}
                    </div>
                  </div>
                )}
              </div>

              {/* Business Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    طريقة الدفع
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cash">نقدي</option>
                    <option value="bank">بنكي</option>
                    <option value="mixed">مختلط</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حد الائتمان (€)
                  </label>
                  <input
                    type="number"
                    name="credit_limit"
                    value={formData.credit_limit}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  إضافة المحل
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStoreModal;
