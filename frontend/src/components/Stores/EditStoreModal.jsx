import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import StoresMap from "./StoresMap";
import {
  updateStore,
  geocodeAddress,
  reverseGeocode,
  isWithinBelgium,
  BELGIAN_CITIES,
} from "../../services/storesAPI";
import { useToastContext } from "../common";

const EditStoreModal = ({ store, isOpen, onClose, onSuccess }) => {
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
    credit_limit: 0,
    notes: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationMethod, setLocationMethod] = useState("address");

  // Initialize form data when store changes
  useEffect(() => {
    if (store && isOpen) {
      setFormData({
        name: store.name || "",
        owner_name: store.owner_name || "",
        phone: store.phone || "",
        email: store.email || "",
        address: store.address || "",
        latitude: store.latitude ? parseFloat(store.latitude) : null,
        longitude: store.longitude ? parseFloat(store.longitude) : null,
        payment_method: store.payment_method || "cash",
        credit_limit: store.credit_limit ? store.credit_limit.toString() : "0",
        notes: store.notes || "",
        is_active: store.is_active !== undefined ? store.is_active : true,
      });
      setShowMap(false);
      setLocationMethod("address");
    }
  }, [store, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      await updateStore(store.id, submitData);
      toast.success("تم تحديث المحل بنجاح");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating store:", error);
      toast.error(error.response?.data?.message || "فشل في تحديث المحل");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !store) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">تعديل المحل</h2>
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
                  انقر على الخريطة لتحديد الموقع الجديد
                </p>
              </div>
              <StoresMap
                height="400px"
                showFilters={false}
                showLocationSelector={true}
                onLocationSelect={handleLocationSelect}
                initialCenter={
                  formData.latitude && formData.longitude
                    ? [formData.latitude, formData.longitude]
                    : undefined
                }
              />
              <div className="mt-4 flex justify-end space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowMap(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            // Form view
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المحل *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم المالك
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    طريقة الدفع
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">نقدي</option>
                    <option value="bank">بنكي</option>
                    <option value="mixed">مختلط</option>
                  </select>
                </div>

                {/* Credit Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الائتماني (€)
                  </label>
                  <input
                    type="number"
                    name="credit_limit"
                    value={formData.credit_limit}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Address Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان *
                </label>
                <div className="space-y-3">
                  {/* Location Method Selection */}
                  <div className="flex space-x-4 space-x-reverse">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locationMethod"
                        value="address"
                        checked={locationMethod === "address"}
                        onChange={(e) => setLocationMethod(e.target.value)}
                        className="ml-2"
                      />
                      البحث بالعنوان
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locationMethod"
                        value="map"
                        checked={locationMethod === "map"}
                        onChange={(e) => setLocationMethod(e.target.value)}
                        className="ml-2"
                      />
                      اختيار من الخريطة
                    </label>
                  </div>

                  {locationMethod === "address" ? (
                    <div className="flex space-x-2 space-x-reverse">
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="أدخل عنوان المحل"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleGeocodeAddress}
                        disabled={geocoding}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      >
                        {geocoding ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <MagnifyingGlassIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowMap(true)}
                        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center"
                      >
                        <MapPinIcon className="h-5 w-5 ml-2" />
                        {formData.latitude && formData.longitude
                          ? "تغيير الموقع على الخريطة"
                          : "اختيار الموقع على الخريطة"}
                      </button>
                      {formData.address && (
                        <p className="mt-2 text-sm text-gray-600">
                          العنوان الحالي: {formData.address}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quick Belgian Cities */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      أو اختر من المدن البلجيكية:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {BELGIAN_CITIES.slice(0, 6).map((city) => (
                        <button
                          key={city.name}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700"
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Status */}
                  {formData.latitude && formData.longitude && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckIcon className="h-4 w-4 ml-1" />
                      تم تحديد الموقع ({formData.latitude.toFixed(4)},{" "}
                      {formData.longitude.toFixed(4)})
                    </div>
                  )}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  المحل نشط
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  )}
                  تحديث المحل
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditStoreModal;
