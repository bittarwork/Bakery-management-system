import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
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
    navigate(`/vehicles/edit/${vehicle.id}`);
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

  // Add vehicle function
  const handleAddVehicle = () => {
    navigate("/vehicles/add");
  };

  // Export vehicles to CSV
  const handleExportCSV = async () => {
    try {
      setActionLoading(true);
      const response = await vehicleService.exportVehiclesCSV();
      
      if (response.success) {
        toast.success('تم تصدير البيانات بنجاح');
      } else {
        toast.error('خطأ في تصدير البيانات');
      }
    } catch (error) {
      toast.error('خطأ في تصدير البيانات');
      console.error('Export error:', error);
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
            onClick={handleExportCSV}
            variant="secondary"
            disabled={actionLoading}
            icon={<Download className="w-4 h-4" />}
          >
            تصدير CSV
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

        
      </AnimatePresence>
    </div>
  );
};

export default VehicleManagementPage;
