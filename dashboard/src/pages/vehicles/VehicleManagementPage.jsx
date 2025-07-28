import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  BarChart3,
  Truck,
  Users,
  AlertTriangle,
  Car,
  Settings,
  RefreshCw,
  Download,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import VehicleCard from "../../components/vehicles/VehicleCard";
import vehicleService from "../../services/vehicleService";
import userService from "../../services/userService";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const VehicleManagementPage = () => {
  // State management
  const [vehicles, setVehicles] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter and search states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    vehicle_type: "",
    assigned: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(12);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedDistributorId, setSelectedDistributorId] = useState("");

  // Add vehicle modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicleData, setNewVehicleData] = useState({
    vehicle_type: "",
    vehicle_model: "",
    vehicle_plate: "",
    vehicle_year: new Date().getFullYear(),
    status: "available",
    fuel_type: "gasoline",
    transmission: "manual",
    vehicle_color: "",
    purchase_price: "",
    currency: "EUR",
    insurance_provider: "",
    insurance_expiry: "",
    registration_expiry: "",
    notes: "",
  });

  // Load initial data
  useEffect(() => {
    loadData();
    loadDistributors();
  }, [currentPage, filters]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load vehicles with filters
      const vehiclesParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      };

      const [vehiclesResponse, statsResponse] = await Promise.all([
        vehicleService.getAllVehicles(vehiclesParams),
        vehicleService.getVehicleStatistics(),
      ]);

      if (vehiclesResponse.success) {
        setVehicles(vehiclesResponse.data.vehicles);
        setTotalPages(vehiclesResponse.data.pagination.totalPages);
      }

      if (statsResponse.success) {
        setStatistics(statsResponse.data);
      }
    } catch (error) {
      toast.error("خطأ في تحميل البيانات");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistributors = async () => {
    try {
      const response = await userService.getUsersByRole("distributor");
      if (response.success) {
        setDistributors(response.data.users);
      }
    } catch (error) {
      console.error("Error loading distributors:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      vehicle_type: "",
      assigned: "",
    });
    setCurrentPage(1);
  };

  // Vehicle actions
  const handleEdit = (vehicle) => {
    // Navigate to edit page (to be implemented)
    console.log("Edit vehicle:", vehicle.id);
    toast("صفحة التعديل قيد التطوير", { icon: "ℹ️" });
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المركبة؟")) return;

    try {
      setActionLoading(true);
      const response = await vehicleService.deleteVehicle(vehicleId);

      if (response.success) {
        toast.success("تم حذف المركبة بنجاح");
        loadData();
      } else {
        toast.error(response.error || "خطأ في حذف المركبة");
      }
    } catch (error) {
      toast.error("خطأ في حذف المركبة");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    setSelectedDistributorId("");
    setShowAssignModal(true);
  };

  const handleUnassign = async (vehicleId) => {
    if (!window.confirm("هل أنت متأكد من إلغاء تعيين هذه المركبة؟")) return;

    try {
      setActionLoading(true);
      const response = await vehicleService.unassignVehicle(vehicleId);

      if (response.success) {
        toast.success("تم إلغاء تعيين المركبة بنجاح");
        loadData();
      } else {
        toast.error(response.error || "خطأ في إلغاء التعيين");
      }
    } catch (error) {
      toast.error("خطأ في إلغاء التعيين");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      setActionLoading(true);
      const response = await vehicleService.updateVehicleStatus(
        vehicleId,
        newStatus
      );

      if (response.success) {
        toast.success("تم تحديث حالة المركبة بنجاح");
        loadData();
      } else {
        toast.error(response.error || "خطأ في تحديث الحالة");
      }
    } catch (error) {
      toast.error("خطأ في تحديث الحالة");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmAssignment = async () => {
    if (!selectedDistributorId) {
      toast.error("يرجى اختيار موزع");
      return;
    }

    try {
      setActionLoading(true);
      const response = await vehicleService.assignVehicle(
        selectedVehicleId,
        selectedDistributorId
      );

      if (response.success) {
        toast.success("تم تعيين المركبة بنجاح");
        setShowAssignModal(false);
        loadData();
      } else {
        toast.error(response.error || "خطأ في تعيين المركبة");
      }
    } catch (error) {
      toast.error("خطأ في تعيين المركبة");
    } finally {
      setActionLoading(false);
    }
  };

  // Add vehicle functions
  const handleAddVehicle = () => {
    setShowAddModal(true);
  };

  const handleNewVehicleChange = (field, value) => {
    setNewVehicleData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const confirmAddVehicle = async () => {
    // Validation
    if (
      !newVehicleData.vehicle_type ||
      !newVehicleData.vehicle_model ||
      !newVehicleData.vehicle_plate
    ) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    try {
      setActionLoading(true);

      // Transform data to match backend expectations
      const vehicleDataForBackend = {
        vehicle_type: newVehicleData.vehicle_type,
        vehicle_model: newVehicleData.vehicle_model,
        vehicle_plate: newVehicleData.vehicle_plate,
        vehicle_year: newVehicleData.vehicle_year,
        vehicle_color: newVehicleData.vehicle_color,
        fuel_type: newVehicleData.fuel_type,
        transmission_type: newVehicleData.transmission,
        insurance_company: newVehicleData.insurance_provider,
        insurance_expiry_date: newVehicleData.insurance_expiry,
        registration_expiry_date: newVehicleData.registration_expiry,
        // Handle price and currency conversion
        purchase_price_eur:
          newVehicleData.currency === "EUR"
            ? parseFloat(newVehicleData.purchase_price) || 0
            : 0,
        purchase_price_syp:
          newVehicleData.currency === "SYP"
            ? parseFloat(newVehicleData.purchase_price) || 0
            : 0,
        notes: newVehicleData.notes,
        is_company_owned: true,
        purchase_date: new Date().toISOString().split("T")[0], // Current date as purchase date
      };

      const response = await vehicleService.createVehicle(
        vehicleDataForBackend
      );

      if (response.success) {
        toast.success("تم إضافة المركبة بنجاح");
        setShowAddModal(false);
        // Reset form
        setNewVehicleData({
          vehicle_type: "",
          vehicle_model: "",
          vehicle_plate: "",
          vehicle_year: new Date().getFullYear(),
          status: "active",
          fuel_type: "gasoline",
          transmission: "manual",
          vehicle_color: "",
          purchase_price: "",
          currency: "EUR",
          insurance_provider: "",
          insurance_expiry: "",
          registration_expiry: "",
          notes: "",
        });
        loadData(); // Reload data
      } else {
        toast.error(response.message || "خطأ في إضافة المركبة");
      }
    } catch (error) {
      toast.error("خطأ في إضافة المركبة");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Truck className="w-8 h-8 mr-3 text-blue-600" />
            إدارة المركبات
          </h1>
          <p className="text-gray-600 mt-2">
            إدارة وتتبع مركبات التوزيع والموزعين
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            onClick={() => loadData()}
            variant="secondary"
            disabled={loading}
            icon={
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            }
          >
            تحديث
          </Button>
          <Button
            onClick={handleAddVehicle}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            إضافة مركبة
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  إجمالي المركبات
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {statistics.total || 0}
                </p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  المركبات النشطة
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {statistics.active || 0}
                </p>
              </div>
              <Car className="w-8 h-8 text-green-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  المركبات المُعينة
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {statistics.assigned || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">
                  في الصيانة
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {statistics.maintenance || 0}
                </p>
              </div>
              <Settings className="w-8 h-8 text-yellow-600" />
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="space-y-4">
            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث بالموديل أو رقم اللوحة..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="secondary"
                icon={<Filter className="w-4 h-4" />}
              >
                فلترة
              </Button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الحالة
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">جميع الحالات</option>
                      <option value="active">نشطة</option>
                      <option value="maintenance">صيانة</option>
                      <option value="inactive">غير نشطة</option>
                      <option value="retired">متقاعدة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نوع المركبة
                    </label>
                    <select
                      value={filters.vehicle_type}
                      onChange={(e) =>
                        handleFilterChange("vehicle_type", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">جميع الأنواع</option>
                      <option value="car">سيارة</option>
                      <option value="van">فان</option>
                      <option value="truck">شاحنة</option>
                      <option value="motorcycle">دراجة نارية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      التعيين
                    </label>
                    <select
                      value={filters.assigned}
                      onChange={(e) =>
                        handleFilterChange("assigned", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">الكل</option>
                      <option value="true">مُعينة</option>
                      <option value="false">غير مُعينة</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3 flex justify-end">
                    <Button
                      onClick={clearFilters}
                      variant="secondary"
                      size="sm"
                      icon={<X className="w-4 h-4" />}
                    >
                      مسح الفلاتر
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardBody>
      </Card>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد مركبات
            </h3>
            <p className="text-gray-500 mb-4">
              لم يتم العثور على مركبات تطابق معايير البحث
            </p>
            <Button
              onClick={handleAddVehicle}
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
            >
              إضافة أول مركبة
            </Button>
          </CardBody>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAssign={handleAssign}
              onUnassign={handleUnassign}
              onStatusChange={handleStatusChange}
            />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="secondary"
              size="sm"
            >
              السابق
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                variant={currentPage === page ? "primary" : "secondary"}
                size="sm"
              >
                {page}
              </Button>
            ))}

            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              variant="secondary"
              size="sm"
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                تعيين مركبة لموزع
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اختر الموزع
                  </label>
                  <select
                    value={selectedDistributorId}
                    onChange={(e) => setSelectedDistributorId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر موزع...</option>
                    {distributors.map((distributor) => (
                      <option key={distributor.id} value={distributor.id}>
                        {distributor.full_name} - {distributor.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 justify-end">
                  <Button
                    onClick={() => setShowAssignModal(false)}
                    variant="secondary"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={confirmAssignment}
                    variant="primary"
                    loading={actionLoading}
                  >
                    تعيين
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Add Vehicle Modal */}
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                إضافة مركبة جديدة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع المركبة *
                  </label>
                  <select
                    value={newVehicleData.vehicle_type}
                    onChange={(e) =>
                      handleNewVehicleChange("vehicle_type", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                    value={newVehicleData.vehicle_model}
                    onChange={(e) =>
                      handleNewVehicleChange("vehicle_model", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                    value={newVehicleData.vehicle_plate}
                    onChange={(e) =>
                      handleNewVehicleChange("vehicle_plate", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                    value={newVehicleData.vehicle_year}
                    onChange={(e) =>
                      handleNewVehicleChange(
                        "vehicle_year",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                    value={newVehicleData.vehicle_color}
                    onChange={(e) =>
                      handleNewVehicleChange("vehicle_color", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل لون المركبة"
                  />
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الوقود
                  </label>
                  <select
                    value={newVehicleData.fuel_type}
                    onChange={(e) =>
                      handleNewVehicleChange("fuel_type", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                    value={newVehicleData.transmission}
                    onChange={(e) =>
                      handleNewVehicleChange("transmission", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">يدوي</option>
                    <option value="automatic">أوتوماتيك</option>
                  </select>
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سعر الشراء
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      value={newVehicleData.purchase_price}
                      onChange={(e) =>
                        handleNewVehicleChange("purchase_price", e.target.value)
                      }
                      className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    <select
                      value={newVehicleData.currency}
                      onChange={(e) =>
                        handleNewVehicleChange("currency", e.target.value)
                      }
                      className="border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EUR">EUR</option>
                      <option value="SYP">SYP</option>
                    </select>
                  </div>
                </div>

                {/* Insurance Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شركة التأمين
                  </label>
                  <input
                    type="text"
                    value={newVehicleData.insurance_provider}
                    onChange={(e) =>
                      handleNewVehicleChange(
                        "insurance_provider",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                    value={newVehicleData.insurance_expiry}
                    onChange={(e) =>
                      handleNewVehicleChange("insurance_expiry", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Registration Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ انتهاء الترخيص
                  </label>
                  <input
                    type="date"
                    value={newVehicleData.registration_expiry}
                    onChange={(e) =>
                      handleNewVehicleChange(
                        "registration_expiry",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    value={newVehicleData.notes}
                    onChange={(e) =>
                      handleNewVehicleChange("notes", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="أدخل أي ملاحظات إضافية"
                  />
                </div>
              </div>

              <div className="flex space-x-3 justify-end mt-6">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="secondary"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={confirmAddVehicle}
                  variant="primary"
                  loading={actionLoading}
                >
                  إضافة المركبة
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleManagementPage;
