import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Download,
  RefreshCw,
  Truck,
  Calendar,
  Fuel,
  Settings,
  User,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import vehicleService from "../../services/vehicleService";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import BackButton from "../../components/ui/BackButton";

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [vehicle, setVehicle] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState("details");

  // Load data
  useEffect(() => {
    if (id && id !== "undefined") {
      loadVehicleDetails();
    } else {
      console.error("Invalid vehicle ID:", id);
      setLoading(false);
      toast.error("معرف المركبة غير صحيح");
      navigate("/vehicles");
    }
  }, [id]);

  const loadVehicleDetails = async () => {
    if (!id || id === "undefined" || id === "null") {
      toast.error("معرف المركبة غير صحيح");
      navigate("/vehicles");
      return;
    }

    try {
      setLoading(true);

      const [vehicleResponse, expensesResponse, statsResponse] =
        await Promise.all([
          vehicleService.getVehicleById(id),
          vehicleService.getVehicleExpenses(id),
          vehicleService.getVehicleStatistics(id),
        ]);

      if (vehicleResponse.success) {
        setVehicle(vehicleResponse.data);
      } else {
        console.error("Failed to load vehicle:", vehicleResponse);
        toast.error("خطأ في تحميل بيانات المركبة");
        navigate("/vehicles");
        return;
      }

      if (expensesResponse.success) {
        setExpenses(expensesResponse.data.expenses || []);
      }

      if (statsResponse.success) {
        setStatistics(statsResponse.data || {});
      }
    } catch (error) {
      console.error("Error loading vehicle details:", error);
      toast.error("خطأ في تحميل البيانات");
      navigate("/vehicles");
    } finally {
      setLoading(false);
    }
  };

  // Handle actions
  const handleEdit = () => {
    if (!id || id === "undefined") {
      toast.error("معرف المركبة غير صحيح");
      return;
    }
    navigate(`/vehicles/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!id || id === "undefined") {
      toast.error("معرف المركبة غير صحيح");
      return;
    }

    if (
      !window.confirm(
        "هل أنت متأكد من حذف هذه المركبة؟ سيتم حذف جميع البيانات المرتبطة بها."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await vehicleService.deleteVehicle(id);

      if (response.success) {
        toast.success("تم حذف المركبة بنجاح");
        navigate("/vehicles");
      } else {
        toast.error(response.error || "خطأ في حذف المركبة");
      }
    } catch (error) {
      toast.error("خطأ في حذف المركبة");
      console.error("Delete error:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportVehicleData = async () => {
    if (!id || id === "undefined") {
      toast.error("معرف المركبة غير صحيح");
      return;
    }

    try {
      setActionLoading(true);
      const response = await vehicleService.exportVehicleData(id);

      if (response.success) {
        toast.success("تم تصدير البيانات بنجاح");
      } else {
        toast.error("خطأ في تصدير البيانات");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("خطأ في تصدير البيانات");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      active: {
        label: "نشطة",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: CheckCircle,
      },
      maintenance: {
        label: "صيانة",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        icon: Settings,
      },
      inactive: {
        label: "غير نشطة",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: XCircle,
      },
      retired: {
        label: "متقاعدة",
        color: "text-red-600",
        bgColor: "bg-red-100",
        icon: XCircle,
      },
    };
    return statusMap[status] || statusMap.inactive;
  };

  const getVehicleTypeIcon = (type) => {
    const typeMap = {
      car: "🚗",
      van: "🚐",
      truck: "🚛",
      motorcycle: "🏍️",
    };
    return typeMap[type] || "🚗";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-SY", {
      style: "currency",
      currency: "EUR",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-SY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
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
      </div>
    );
  }

  const statusInfo = getStatusInfo(vehicle.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center space-x-4">
          <BackButton to="/vehicles" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="text-4xl mr-3">
                {getVehicleTypeIcon(vehicle.vehicle_type)}
              </span>
              {vehicle.vehicle_model}
            </h1>
            <p className="text-gray-600 mt-1">
              {vehicle.vehicle_plate} • {vehicle.vehicle_year}
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-full ${statusInfo.bgColor} ${statusInfo.color} flex items-center space-x-2`}
          >
            <StatusIcon className="w-4 h-4" />
            <span className="font-semibold">{statusInfo.label}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button
            onClick={() => loadVehicleDetails()}
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
            onClick={handleExportVehicleData}
            variant="secondary"
            disabled={actionLoading || !vehicle}
            icon={<Download className="w-4 h-4" />}
          >
            تصدير البيانات
          </Button>
          <Button
            onClick={handleEdit}
            variant="primary"
            disabled={!vehicle}
            icon={<Edit3 className="w-4 h-4" />}
          >
            تعديل
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            disabled={
              actionLoading || !vehicle || vehicle.assigned_distributor_id
            }
            icon={<Trash2 className="w-4 h-4" />}
            title={
              vehicle && vehicle.assigned_distributor_id
                ? "لا يمكن حذف المركبة المُعيّنة لموزع"
                : ""
            }
          >
            حذف
          </Button>
          {vehicle && vehicle.assigned_distributor_id && (
            <p className="text-xs text-gray-500 mt-1">
              * لا يمكن حذف المركبة المُعيّنة لموزع
            </p>
          )}
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">
                  المسافة المقطوعة
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {(vehicle.current_km || 0).toLocaleString()} كم
                </p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">
                  إجمالي النفقات
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(statistics.totalExpenses)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">
                  متوسط استهلاك الوقود
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {vehicle.fuel_consumption || 0} ل/100كم
                </p>
              </div>
              <Fuel className="w-8 h-8 text-purple-600" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">
                  عدد الرحلات
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {statistics.totalTrips || 0}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "details", label: "التفاصيل", icon: FileText },
            { id: "expenses", label: "النفقات", icon: DollarSign },
            { id: "maintenance", label: "الصيانة", icon: Settings },
            { id: "history", label: "السجل", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">المعلومات الأساسية</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      نوع المركبة
                    </label>
                    <p className="text-gray-900">{vehicle.vehicle_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      الموديل
                    </label>
                    <p className="text-gray-900">{vehicle.vehicle_model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      رقم اللوحة
                    </label>
                    <p className="text-gray-900 font-bold">
                      {vehicle.vehicle_plate}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      سنة الصنع
                    </label>
                    <p className="text-gray-900">{vehicle.vehicle_year}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      نوع الوقود
                    </label>
                    <p className="text-gray-900">{vehicle.fuel_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      ناقل الحركة
                    </label>
                    <p className="text-gray-900">
                      {vehicle.transmission_type === "manual"
                        ? "يدوي"
                        : "أوتوماتيك"}
                    </p>
                  </div>
                  {vehicle.engine_capacity && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        سعة المحرك
                      </label>
                      <p className="text-gray-900">{vehicle.engine_capacity}</p>
                    </div>
                  )}
                  {vehicle.carrying_capacity && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        الحمولة
                      </label>
                      <p className="text-gray-900">
                        {vehicle.carrying_capacity} كغ
                      </p>
                    </div>
                  )}
                </div>

                {vehicle.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      ملاحظات
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {vehicle.notes}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Assigned Distributor */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">الموزع المُعين</h3>
              </CardHeader>
              <CardBody>
                {vehicle.assignedDistributor ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {vehicle.assignedDistributor.full_name}
                      </h4>
                      <p className="text-gray-600">
                        {vehicle.assignedDistributor.phone}
                      </p>
                      <p className="text-gray-600">
                        {vehicle.assignedDistributor.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      لم يتم تعيين موزع لهذه المركبة
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Maintenance Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">معلومات الصيانة</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      آخر صيانة
                    </label>
                    <p className="text-gray-900">
                      {vehicle.last_maintenance_date
                        ? formatDate(vehicle.last_maintenance_date)
                        : "لا توجد بيانات"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      العداد عند آخر صيانة
                    </label>
                    <p className="text-gray-900">
                      {vehicle.last_maintenance_km
                        ? `${vehicle.last_maintenance_km.toLocaleString()} كم`
                        : "لا توجد بيانات"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      الصيانة القادمة
                    </label>
                    <p className="text-gray-900">
                      {vehicle.next_maintenance_km
                        ? `${vehicle.next_maintenance_km.toLocaleString()} كم`
                        : "لا توجد بيانات"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      فترة الصيانة
                    </label>
                    <p className="text-gray-900">
                      {vehicle.maintenance_interval_km
                        ? `كل ${vehicle.maintenance_interval_km.toLocaleString()} كم`
                        : "لا توجد بيانات"}
                    </p>
                  </div>
                </div>

                {/* Maintenance Alert */}
                {vehicle.current_km &&
                  vehicle.next_maintenance_km &&
                  vehicle.current_km >= vehicle.next_maintenance_km && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="font-semibold text-amber-800">
                          تحذير: صيانة مستحقة!
                        </span>
                      </div>
                      <p className="text-amber-700 text-sm mt-1">
                        تحتاج هذه المركبة إلى صيانة. العداد الحالي:{" "}
                        {vehicle.current_km.toLocaleString()} كم
                      </p>
                    </div>
                  )}
              </CardBody>
            </Card>

            {/* Registration Info */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">معلومات التسجيل</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      تاريخ التسجيل
                    </label>
                    <p className="text-gray-900">
                      {vehicle.registration_date
                        ? formatDate(vehicle.registration_date)
                        : "لا توجد بيانات"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      تاريخ انتهاء التسجيل
                    </label>
                    <p className="text-gray-900">
                      {vehicle.registration_expiry_date
                        ? formatDate(vehicle.registration_expiry_date)
                        : "لا توجد بيانات"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      تاريخ انتهاء التأمين
                    </label>
                    <p className="text-gray-900">
                      {vehicle.insurance_expiry_date
                        ? formatDate(vehicle.insurance_expiry_date)
                        : "لا توجد بيانات"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      تاريخ الإضافة
                    </label>
                    <p className="text-gray-900">
                      {formatDate(vehicle.created_at)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === "expenses" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">سجل النفقات</h3>
                <div className="text-sm text-gray-600">
                  إجمالي النفقات:{" "}
                  <span className="font-bold">
                    {formatCurrency(statistics.totalExpenses)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {expenses.length > 0 ? (
                <div className="space-y-4">
                  {expenses.map((expense, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-100 pb-4 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {expense.description || "نفقة"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(expense.date)} • {expense.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {formatCurrency(expense.amount)}
                          </p>
                          {expense.km && (
                            <p className="text-sm text-gray-600">
                              {expense.km.toLocaleString()} كم
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">لا توجد نفقات مسجلة</p>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {activeTab === "maintenance" && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">سجل الصيانة</h3>
            </CardHeader>
            <CardBody>
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">سيتم إضافة سجل الصيانة قريباً</p>
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">سجل الأنشطة</h3>
            </CardHeader>
            <CardBody>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">سيتم إضافة سجل الأنشطة قريباً</p>
              </div>
            </CardBody>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default VehicleDetailsPage;
