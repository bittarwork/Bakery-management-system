import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, Edit3, Truck } from "lucide-react";
import { toast } from "react-hot-toast";
import vehicleService from "../../services/vehicleService";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const EditVehiclePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vehicle, setVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_type: "",
    vehicle_model: "",
    vehicle_plate: "",
    vehicle_year: new Date().getFullYear(),
    vehicle_color: "",
    fuel_type: "gasoline",
    transmission: "manual",
    engine_capacity: "",
    purchase_price: "",
    currency: "EUR",
    insurance_provider: "",
    insurance_expiry: "",
    registration_expiry: "",
    purchase_date: "",
    notes: "",
  });

  // Load vehicle data
  useEffect(() => {
    loadVehicleData();
  }, [id]);

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicleById(id);
      
      if (response.success && response.data) {
        const vehicleData = response.data;
        setVehicle(vehicleData);
        
        // Transform backend data to form format
        setFormData({
          vehicle_type: vehicleData.vehicle_type || "",
          vehicle_model: vehicleData.vehicle_model || "",
          vehicle_plate: vehicleData.vehicle_plate || "",
          vehicle_year: vehicleData.vehicle_year || new Date().getFullYear(),
          vehicle_color: vehicleData.vehicle_color || "",
          fuel_type: vehicleData.fuel_type || "gasoline",
          transmission: vehicleData.transmission_type || "manual",
          engine_capacity: vehicleData.engine_capacity || "",
          // Determine price and currency from existing data
          purchase_price: vehicleData.purchase_price_eur > 0 
            ? vehicleData.purchase_price_eur.toString() 
            : vehicleData.purchase_price_syp > 0 
              ? vehicleData.purchase_price_syp.toString() 
              : "",
          currency: vehicleData.purchase_price_eur > 0 ? "EUR" : "SYP",
          insurance_provider: vehicleData.insurance_company || "",
          insurance_expiry: vehicleData.insurance_expiry_date 
            ? vehicleData.insurance_expiry_date.split('T')[0] 
            : "",
          registration_expiry: vehicleData.registration_expiry_date 
            ? vehicleData.registration_expiry_date.split('T')[0] 
            : "",
          purchase_date: vehicleData.purchase_date 
            ? vehicleData.purchase_date.split('T')[0] 
            : "",
          notes: vehicleData.notes || "",
        });
      } else {
        toast.error("لم يتم العثور على المركبة");
        navigate("/vehicles");
      }
    } catch (error) {
      toast.error("خطأ في تحميل بيانات المركبة");
      console.error("Error loading vehicle:", error);
      navigate("/vehicles");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.vehicle_type || !formData.vehicle_model || !formData.vehicle_plate) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    try {
      setSaving(true);

      // Transform data to match backend expectations
      const vehicleDataForBackend = {
        vehicle_type: formData.vehicle_type,
        vehicle_model: formData.vehicle_model,
        vehicle_plate: formData.vehicle_plate,
        vehicle_year: formData.vehicle_year,
        vehicle_color: formData.vehicle_color,
        fuel_type: formData.fuel_type,
        transmission_type: formData.transmission,
        engine_capacity: formData.engine_capacity,
        insurance_company: formData.insurance_provider,
        insurance_expiry_date: formData.insurance_expiry,
        registration_expiry_date: formData.registration_expiry,
        purchase_date: formData.purchase_date,
        // Handle price and currency conversion
        purchase_price_eur: formData.currency === "EUR" ? parseFloat(formData.purchase_price) || 0 : 0,
        purchase_price_syp: formData.currency === "SYP" ? parseFloat(formData.purchase_price) || 0 : 0,
        notes: formData.notes,
        is_company_owned: true,
      };

      const response = await vehicleService.updateVehicle(id, vehicleDataForBackend);

      if (response.success) {
        toast.success("تم تحديث المركبة بنجاح");
        navigate("/vehicles");
      } else {
        toast.error(response.message || "خطأ في تحديث المركبة");
      }
    } catch (error) {
      toast.error("خطأ في تحديث المركبة");
      console.error("Error updating vehicle:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          لم يتم العثور على المركبة
        </h3>
        <p className="text-gray-500 mb-4">
          المركبة المطلوبة غير موجودة أو تم حذفها
        </p>
        <Button
          onClick={() => navigate("/vehicles")}
          variant="primary"
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          العودة إلى قائمة المركبات
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/vehicles")}
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Edit3 className="w-8 h-8 mr-3 text-blue-600" />
              تعديل المركبة
            </h1>
            <p className="text-gray-600 mt-2">
              تعديل تفاصيل المركبة: {vehicle.vehicle_model} - {vehicle.vehicle_plate}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              معلومات المركبة
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  المعلومات الأساسية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع المركبة *
                    </label>
                    <select
                      value={formData.vehicle_type}
                      onChange={(e) => handleInputChange("vehicle_type", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">اختر نوع المركبة...</option>
                      <option value="truck">شاحنة</option>
                      <option value="van">فان</option>
                      <option value="motorcycle">دراجة نارية</option>
                      <option value="car">سيارة</option>
                    </select>
                  </div>

                  {/* Vehicle Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموديل *
                    </label>
                    <input
                      type="text"
                      value={formData.vehicle_model}
                      onChange={(e) => handleInputChange("vehicle_model", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="أدخل موديل المركبة"
                      required
                    />
                  </div>

                  {/* License Plate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم اللوحة *
                    </label>
                    <input
                      type="text"
                      value={formData.vehicle_plate}
                      onChange={(e) => handleInputChange("vehicle_plate", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="أدخل رقم اللوحة"
                      required
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سنة الصنع
                    </label>
                    <input
                      type="number"
                      value={formData.vehicle_year}
                      onChange={(e) => handleInputChange("vehicle_year", parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1990"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اللون
                    </label>
                    <input
                      type="text"
                      value={formData.vehicle_color}
                      onChange={(e) => handleInputChange("vehicle_color", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="أدخل لون المركبة"
                    />
                  </div>

                  {/* Engine Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سعة المحرك
                    </label>
                    <input
                      type="text"
                      value={formData.engine_capacity}
                      onChange={(e) => handleInputChange("engine_capacity", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="مثال: 2.0L"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  المواصفات التقنية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fuel Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الوقود
                    </label>
                    <select
                      value={formData.fuel_type}
                      onChange={(e) => handleInputChange("fuel_type", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="gasoline">بنزين</option>
                      <option value="diesel">ديزل</option>
                      <option value="electric">كهربائي</option>
                      <option value="hybrid">هجين</option>
                    </select>
                  </div>

                  {/* Transmission */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ناقل الحركة
                    </label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => handleInputChange("transmission", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="manual">يدوي</option>
                      <option value="automatic">أوتوماتيك</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  المعلومات المالية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Purchase Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ الشراء
                    </label>
                    <input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => handleInputChange("purchase_date", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Purchase Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سعر الشراء
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        value={formData.purchase_price}
                        onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                        className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange("currency", e.target.value)}
                        className="border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="EUR">EUR</option>
                        <option value="SYP">SYP</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance & Registration */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  التأمين والترخيص
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Insurance Provider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شركة التأمين
                    </label>
                    <input
                      type="text"
                      value={formData.insurance_provider}
                      onChange={(e) => handleInputChange("insurance_provider", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="أدخل اسم شركة التأمين"
                    />
                  </div>

                  {/* Insurance Expiry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ انتهاء التأمين
                    </label>
                    <input
                      type="date"
                      value={formData.insurance_expiry}
                      onChange={(e) => handleInputChange("insurance_expiry", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Registration Expiry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ انتهاء الترخيص
                    </label>
                    <input
                      type="date"
                      value={formData.registration_expiry}
                      onChange={(e) => handleInputChange("registration_expiry", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  معلومات إضافية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحالة الحالية
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === 'active' ? 'bg-green-100 text-green-800' :
                        vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        vehicle.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {vehicleService.getStatusInfo(vehicle.status).arabicName}
                      </span>
                      <span className="text-sm text-gray-500">
                        (يمكن تغيير الحالة من الصفحة الرئيسية)
                      </span>
                    </div>
                  </div>

                  {/* Assigned Distributor */}
                  {vehicle.assignedDistributor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الموزع المُعين
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {vehicle.assignedDistributor.full_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          (يمكن تغيير التعيين من الصفحة الرئيسية)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    placeholder="أدخل أي ملاحظات إضافية عن المركبة"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  icon={<Save className="w-4 h-4" />}
                  className="sm:ml-auto"
                >
                  حفظ التغييرات
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/vehicles")}
                  icon={<X className="w-4 h-4" />}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default EditVehiclePage; 