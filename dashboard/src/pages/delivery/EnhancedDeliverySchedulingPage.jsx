/**
 * Enhanced Delivery Scheduling Page
 * Complete delivery scheduling management with advanced features
 * Follows the same design patterns as Users and Stores management pages
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Truck,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  MoreVertical,
  FileText,
  BarChart3,
  Users,
  Euro,
  Navigation,
  Timer,
  Package,
  Route,
  Activity,
  TrendingUp,
  Zap,
  List,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import deliverySchedulingService from "../../services/deliverySchedulingService";

const EnhancedDeliverySchedulingPage = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [liveTracking, setLiveTracking] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [capacity, setCapacity] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Active tab management
  const [activeTab, setActiveTab] = useState("schedules");

  // View mode (list/calendar)
  const [viewMode, setViewMode] = useState("list");

  // Search and filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    time_slot: "",
    delivery_type: "",
    date_from: "",
    date_to: "",
    distributor_id: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    totalSchedules: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    missedDeliveries: 0,
    averageDeliveryTime: 0,
    completionRate: 0,
  });

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    scheduleId: null,
    scheduleInfo: "",
    isLoading: false,
  });

  // Create/Edit modal
  const [scheduleModal, setScheduleModal] = useState({
    isOpen: false,
    isEdit: false,
    scheduleId: null,
    isLoading: false,
    formData: {
      order_id: "",
      scheduled_date: "",
      scheduled_time_start: "",
      scheduled_time_end: "",
      time_slot: "morning",
      delivery_type: "standard",
      priority: "normal",
      delivery_address: "",
      delivery_instructions: "",
      contact_person: "",
      contact_phone: "",
      contact_email: "",
      delivery_fee_eur: 0,
    },
  });

  // Load initial data
  useEffect(() => {
    loadTabData();
  }, [activeTab, filters, pagination.currentPage]);

  // Auto-refresh for live tracking
  useEffect(() => {
    let interval;
    if (activeTab === "tracking") {
      interval = setInterval(loadLiveTracking, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab]);

  const loadTabData = async () => {
    setIsLoading(true);
    try {
      setError("");

      switch (activeTab) {
        case "schedules":
          await Promise.all([loadSchedules(), loadStatistics()]);
          break;
        case "tracking":
          await loadLiveTracking();
          break;
        case "analytics":
          await loadAnalytics();
          break;
        case "capacity":
          await loadCapacity();
          break;
        default:
          await loadSchedules();
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSchedules = async () => {
    const params = {
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      view: viewMode,
      ...filters,
    };

    const response = await deliverySchedulingService.getDeliverySchedules(
      params
    );
    if (response.success) {
      setSchedules(response.data.schedules || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.pagination?.totalPages || 1,
        totalItems: response.data.pagination?.totalItems || 0,
      }));
    }
  };

  const loadLiveTracking = async () => {
    const response = await deliverySchedulingService.getLiveDeliveryTracking({
      date: new Date().toISOString().split("T")[0],
      active_only: true,
    });
    if (response.success) {
      setLiveTracking(response.data.tracking || []);
    }
  };

  const loadAnalytics = async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const response = await deliverySchedulingService.getDeliveryAnalytics({
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      include_trends: true,
      include_performance: true,
    });
    if (response.success) {
      setAnalytics(response.data);
    }
  };

  const loadCapacity = async () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const response = await deliverySchedulingService.getDeliveryCapacity({
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      include_suggestions: true,
    });
    if (response.success) {
      setCapacity(response.data);
    }
  };

  const loadStatistics = async () => {
    try {
      if (schedules.length > 0) {
        const metrics =
          deliverySchedulingService.calculateDeliveryMetrics(schedules);
        setStatistics({
          totalSchedules: metrics.total,
          completedDeliveries: metrics.completed,
          pendingDeliveries: metrics.pending,
          missedDeliveries: metrics.missed,
          completionRate: parseFloat(metrics.completionRate),
          averageDeliveryTime: 45, // This would come from analytics API
        });
      }
    } catch (error) {
      console.error("Error calculating statistics:", error);
    }
  };

  const handleCreateSchedule = () => {
    setScheduleModal({
      isOpen: true,
      isEdit: false,
      scheduleId: null,
      isLoading: false,
      formData: {
        order_id: "",
        scheduled_date: "",
        scheduled_time_start: "",
        scheduled_time_end: "",
        time_slot: "morning",
        delivery_type: "standard",
        priority: "normal",
        delivery_address: "",
        delivery_instructions: "",
        contact_person: "",
        contact_phone: "",
        contact_email: "",
        delivery_fee_eur: 0,
      },
    });
  };

  const handleEditSchedule = (schedule) => {
    setScheduleModal({
      isOpen: true,
      isEdit: true,
      scheduleId: schedule.id,
      isLoading: false,
      formData: {
        order_id: schedule.order_id,
        scheduled_date: schedule.scheduled_date,
        scheduled_time_start: schedule.scheduled_time_start,
        scheduled_time_end: schedule.scheduled_time_end,
        time_slot: schedule.time_slot,
        delivery_type: schedule.delivery_type,
        priority: schedule.priority,
        delivery_address: schedule.delivery_address || "",
        delivery_instructions: schedule.delivery_instructions || "",
        contact_person: schedule.contact_person || "",
        contact_phone: schedule.contact_phone || "",
        contact_email: schedule.contact_email || "",
        delivery_fee_eur: schedule.delivery_fee_eur || 0,
      },
    });
  };

  const handleSaveSchedule = async () => {
    setScheduleModal((prev) => ({ ...prev, isLoading: true }));
    try {
      const validation = deliverySchedulingService.validateScheduleData(
        scheduleModal.formData
      );
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return;
      }

      let response;
      if (scheduleModal.isEdit) {
        response = await deliverySchedulingService.updateDeliverySchedule(
          scheduleModal.scheduleId,
          scheduleModal.formData
        );
      } else {
        response = await deliverySchedulingService.createDeliverySchedule(
          scheduleModal.formData
        );
      }

      if (response.success) {
        setSuccess(
          scheduleModal.isEdit
            ? "تم تحديث الجدولة بنجاح"
            : "تم إنشاء الجدولة بنجاح"
        );
        setScheduleModal((prev) => ({ ...prev, isOpen: false }));
        await loadSchedules();
      } else {
        setError(response.message || "فشل في حفظ الجدولة");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      setError("فشل في حفظ الجدولة. يرجى المحاولة مرة أخرى.");
    } finally {
      setScheduleModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteSchedule = (schedule) => {
    setDeleteModal({
      isOpen: true,
      scheduleId: schedule.id,
      scheduleInfo: `${schedule.order?.order_number || schedule.order_id} - ${
        schedule.contact_person || "غير محدد"
      }`,
      isLoading: false,
    });
  };

  const confirmDeleteSchedule = async () => {
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await deliverySchedulingService.cancelDeliverySchedule(
        deleteModal.scheduleId,
        "تم الحذف من لوحة التحكم"
      );

      if (response.success) {
        setSuccess("تم حذف الجدولة بنجاح");
        setDeleteModal({
          isOpen: false,
          scheduleId: null,
          scheduleInfo: "",
          isLoading: false,
        });
        await loadSchedules();
      } else {
        setError(response.message || "فشل في حذف الجدولة");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      setError("فشل في حذف الجدولة. يرجى المحاولة مرة أخرى.");
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await deliverySchedulingService.exportDeliverySchedules({
        format: "excel",
        ...filters,
      });

      // Create download link
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `delivery-schedules-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      setSuccess("تم تصدير البيانات بنجاح");
    } catch (error) {
      console.error("Error exporting:", error);
      setError("فشل في تصدير البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      time_slot: "",
      delivery_type: "",
      date_from: "",
      date_to: "",
      distributor_id: "",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: "bg-blue-100 text-blue-800", label: "مجدول" },
      confirmed: { color: "bg-green-100 text-green-800", label: "مؤكد" },
      in_progress: {
        color: "bg-yellow-100 text-yellow-800",
        label: "جاري التسليم",
      },
      delivered: {
        color: "bg-emerald-100 text-emerald-800",
        label: "تم التسليم",
      },
      missed: { color: "bg-red-100 text-red-800", label: "فات الموعد" },
      cancelled: { color: "bg-gray-100 text-gray-800", label: "ملغي" },
      rescheduled: {
        color: "bg-purple-100 text-purple-800",
        label: "معاد جدولته",
      },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: "bg-gray-100 text-gray-800", label: "منخفض" },
      normal: { color: "bg-blue-100 text-blue-800", label: "عادي" },
      high: { color: "bg-orange-100 text-orange-800", label: "عالي" },
      urgent: { color: "bg-red-100 text-red-800", label: "عاجل" },
    };

    const config = priorityConfig[priority] || priorityConfig.normal;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const renderStatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardBody className="flex items-center">
          <div className="flex items-center">
            <Package className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">إجمالي الجدولة</p>
              <p className="text-2xl font-bold">{statistics.totalSchedules}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardBody className="flex items-center">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">تم التسليم</p>
              <p className="text-2xl font-bold">
                {statistics.completedDeliveries}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
        <CardBody className="flex items-center">
          <div className="flex items-center">
            <Clock className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">في الانتظار</p>
              <p className="text-2xl font-bold">
                {statistics.pendingDeliveries}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardBody className="flex items-center">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">فات الموعد</p>
              <p className="text-2xl font-bold">
                {statistics.missedDeliveries}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardBody className="flex items-center">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">معدل الإنجاز</p>
              <p className="text-2xl font-bold">{statistics.completionRate}%</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <CardBody className="flex items-center">
          <div className="flex items-center">
            <Timer className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">متوسط الوقت</p>
              <p className="text-2xl font-bold">
                {statistics.averageDeliveryTime}د
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          فلاتر البحث
        </h3>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EnhancedInput
            type="text"
            placeholder="البحث في الجدولة..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            icon={Search}
          />

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">جميع الحالات</option>
            <option value="scheduled">مجدول</option>
            <option value="confirmed">مؤكد</option>
            <option value="in_progress">جاري التسليم</option>
            <option value="delivered">تم التسليم</option>
            <option value="missed">فات الموعد</option>
            <option value="cancelled">ملغي</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.time_slot}
            onChange={(e) => handleFilterChange("time_slot", e.target.value)}
          >
            <option value="">جميع الفترات</option>
            <option value="morning">صباحي</option>
            <option value="afternoon">بعد الظهر</option>
            <option value="evening">مسائي</option>
            <option value="custom">مخصص</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filters.delivery_type}
            onChange={(e) =>
              handleFilterChange("delivery_type", e.target.value)
            }
          >
            <option value="">جميع الأنواع</option>
            <option value="standard">عادي</option>
            <option value="express">سريع</option>
            <option value="scheduled">مجدول</option>
            <option value="pickup">استلام</option>
          </select>

          <EnhancedInput
            type="date"
            placeholder="من تاريخ"
            value={filters.date_from}
            onChange={(e) => handleFilterChange("date_from", e.target.value)}
          />

          <EnhancedInput
            type="date"
            placeholder="إلى تاريخ"
            value={filters.date_to}
            onChange={(e) => handleFilterChange("date_to", e.target.value)}
          />

          <div className="flex space-x-2">
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={clearFilters}
              icon={RefreshCw}
            >
              مسح الفلاتر
            </EnhancedButton>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const renderSchedulesTable = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">جدولة التسليم</h3>
        <div className="flex space-x-2">
          <div className="flex rounded-lg border border-gray-300">
            <button
              className={`px-3 py-1 text-sm ${
                viewMode === "list" ? "bg-blue-500 text-white" : "text-gray-600"
              }`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              className={`px-3 py-1 text-sm ${
                viewMode === "calendar"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600"
              }`}
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          <EnhancedButton
            variant="outline"
            size="sm"
            onClick={handleExport}
            icon={Download}
            loading={isExporting}
          >
            تصدير
          </EnhancedButton>
          <EnhancedButton
            variant="primary"
            size="sm"
            onClick={handleCreateSchedule}
            icon={Plus}
          >
            جدولة جديدة
          </EnhancedButton>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Truck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>لا توجد جدولة حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الطلب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ والوقت
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    جهة الاتصال
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الأولوية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الرسوم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {schedules.map((schedule) => (
                    <motion.tr
                      key={schedule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {schedule.order?.order_number ||
                              `#${schedule.order_id}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {schedule.delivery_type && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {deliverySchedulingService.formatDeliveryTypeForDisplay(
                                  schedule.delivery_type
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {schedule.scheduled_date}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {schedule.scheduled_time_start}
                            {schedule.scheduled_time_end &&
                              ` - ${schedule.scheduled_time_end}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {schedule.contact_person || "غير محدد"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {schedule.contact_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(schedule.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(schedule.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <Euro className="w-4 h-4 mr-1" />
                          {schedule.delivery_fee_eur || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/delivery/schedules/${schedule.id}`)
                            }
                            className="text-blue-600 hover:text-blue-800"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="text-green-600 hover:text-green-800"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule)}
                            className="text-red-600 hover:text-red-800"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              عرض {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
              إلى{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              من {pagination.totalItems} نتيجة
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }))
                }
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                السابق
              </button>
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, currentPage: page }))
                    }
                    className={`px-3 py-2 text-sm border rounded-lg ${
                      pagination.currentPage === page
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );

  const renderLiveTracking = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-500" />
          التتبع المباشر
          <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        </h3>
        <div className="text-xs text-gray-500">
          آخر تحديث: {new Date().toLocaleTimeString("ar-EG")}
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : liveTracking.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Navigation className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>لا توجد عمليات تسليم نشطة حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {liveTracking.map((tracking) => (
              <motion.div
                key={tracking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h4 className="font-medium text-gray-900">
                      {tracking.schedule?.order?.order_number ||
                        `#${tracking.schedule?.order_id}`}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {tracking.schedule?.contact_person}
                    </span>
                  </div>
                  <div className="text-sm">
                    {getStatusBadge(tracking.status)}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>
                      {tracking.schedule?.delivery_address || "غير محدد"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {tracking.estimated_arrival
                        ? `الوصول المتوقع: ${new Date(
                            tracking.estimated_arrival
                          ).toLocaleTimeString("ar-EG")}`
                        : "الوقت غير محدد"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>
                      الموزع: {tracking.distributor?.name || "غير محدد"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            إحصائيات الأداء
          </h3>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.overview?.total_deliveries || 0}
                </div>
                <div className="text-sm text-gray-600">إجمالي التسليمات</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.overview?.completion_rate || 0}%
                </div>
                <div className="text-sm text-gray-600">معدل الإنجاز</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {analytics.overview?.avg_delivery_time || 0}د
                </div>
                <div className="text-sm text-gray-600">متوسط وقت التسليم</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics.overview?.customer_rating || 0}
                </div>
                <div className="text-sm text-gray-600">تقييم العملاء</div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Performance trends would go here */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            اتجاهات الأداء
          </h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>سيتم عرض مخططات الأداء هنا</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderCapacity = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          إدارة السعة
        </h3>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {capacity.summary?.total_capacity || 0}
                </div>
                <div className="text-sm text-gray-600">السعة الإجمالية</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {capacity.summary?.available_capacity || 0}
                </div>
                <div className="text-sm text-gray-600">السعة المتاحة</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {capacity.summary?.utilization_rate || 0}%
                </div>
                <div className="text-sm text-gray-600">معدل الاستخدام</div>
              </div>
            </div>

            {capacity.suggestions && capacity.suggestions.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  اقتراحات تحسين السعة:
                </h4>
                <div className="space-y-2">
                  {capacity.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          {suggestion.title}
                        </p>
                        <p className="text-sm text-yellow-700">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "schedules":
        return (
          <>
            {renderStatisticsCards()}
            {renderFilters()}
            {renderSchedulesTable()}
          </>
        );
      case "tracking":
        return renderLiveTracking();
      case "analytics":
        return renderAnalytics();
      case "capacity":
        return renderCapacity();
      default:
        return renderSchedulesTable();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Truck className="w-8 h-8 mr-3 text-blue-600" />
            إدارة جدولة التسليم المتقدمة
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            إدارة شاملة لجدولة التسليم مع التتبع المباشر وتحليلات الأداء
          </p>
        </div>
        <div className="flex space-x-3">
          <EnhancedButton
            variant="outline"
            onClick={loadTabData}
            icon={RefreshCw}
            loading={isLoading}
          >
            تحديث
          </EnhancedButton>
        </div>
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
            <button
              onClick={() => setError("")}
              className="mr-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
            <button
              onClick={() => setSuccess("")}
              className="mr-auto text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <Card>
        <CardBody>
          <nav className="flex space-x-8">
            {[
              { id: "schedules", label: "الجدولة", icon: Calendar },
              { id: "tracking", label: "التتبع المباشر", icon: Navigation },
              { id: "analytics", label: "التحليلات", icon: BarChart3 },
              { id: "capacity", label: "إدارة السعة", icon: Zap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </CardBody>
      </Card>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Create/Edit Schedule Modal */}
      <AnimatePresence>
        {scheduleModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {scheduleModal.isEdit ? "تعديل الجدولة" : "إنشاء جدولة جديدة"}
                </h3>
                <button
                  onClick={() =>
                    setScheduleModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSchedule();
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <EnhancedInput
                    type="number"
                    label="معرف الطلب"
                    value={scheduleModal.formData.order_id}
                    onChange={(e) =>
                      setScheduleModal((prev) => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          order_id: e.target.value,
                        },
                      }))
                    }
                    required
                  />

                  <EnhancedInput
                    type="date"
                    label="تاريخ التسليم"
                    value={scheduleModal.formData.scheduled_date}
                    onChange={(e) =>
                      setScheduleModal((prev) => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          scheduled_date: e.target.value,
                        },
                      }))
                    }
                    required
                  />

                  <EnhancedInput
                    type="time"
                    label="وقت البداية"
                    value={scheduleModal.formData.scheduled_time_start}
                    onChange={(e) =>
                      setScheduleModal((prev) => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          scheduled_time_start: e.target.value,
                        },
                      }))
                    }
                    required
                  />

                  <EnhancedInput
                    type="time"
                    label="وقت النهاية (اختياري)"
                    value={scheduleModal.formData.scheduled_time_end}
                    onChange={(e) =>
                      setScheduleModal((prev) => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          scheduled_time_end: e.target.value,
                        },
                      }))
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الفترة الزمنية
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={scheduleModal.formData.time_slot}
                      onChange={(e) =>
                        setScheduleModal((prev) => ({
                          ...prev,
                          formData: {
                            ...prev.formData,
                            time_slot: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="morning">صباحي</option>
                      <option value="afternoon">بعد الظهر</option>
                      <option value="evening">مسائي</option>
                      <option value="custom">مخصص</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع التسليم
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={scheduleModal.formData.delivery_type}
                      onChange={(e) =>
                        setScheduleModal((prev) => ({
                          ...prev,
                          formData: {
                            ...prev.formData,
                            delivery_type: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="standard">عادي</option>
                      <option value="express">سريع</option>
                      <option value="scheduled">مجدول</option>
                      <option value="pickup">استلام</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الأولوية
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={scheduleModal.formData.priority}
                      onChange={(e) =>
                        setScheduleModal((prev) => ({
                          ...prev,
                          formData: {
                            ...prev.formData,
                            priority: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="low">منخفض</option>
                      <option value="normal">عادي</option>
                      <option value="high">عالي</option>
                      <option value="urgent">عاجل</option>
                    </select>
                  </div>

                  <EnhancedInput
                    type="number"
                    step="0.01"
                    label="رسوم التسليم (يورو)"
                    value={scheduleModal.formData.delivery_fee_eur}
                    onChange={(e) =>
                      setScheduleModal((prev) => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          delivery_fee_eur: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                  />

                  <EnhancedInput
                    type="text"
                    label="جهة الاتصال"
                    value={scheduleModal.formData.contact_person}
                    onChange={(e) =>
                      setScheduleModal((prev) => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          contact_person: e.target.value,
                        },
                      }))
                    }
                  />

                  <EnhancedInput
                    type="tel"
                    label="رقم الهاتف"
                    value={scheduleModal.formData.contact_phone}
                    onChange={(e) =>
                      setScheduleModal((prev) => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          contact_phone: e.target.value,
                        },
                      }))
                    }
                  />

                  <EnhancedInput
                    type="email"
                    label="البريد الإلكتروني"
                    value={scheduleModal.formData.contact_email}
                    onChange={(e) =>
                      setScheduleModal((prev) => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          contact_email: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان التسليم
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={scheduleModal.formData.delivery_address}
                    onChange={(e) =>
                      setScheduleModal((prev) => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          delivery_address: e.target.value,
                        },
                      }))
                    }
                    placeholder="أدخل عنوان التسليم..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تعليمات التسليم
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    value={scheduleModal.formData.delivery_instructions}
                    onChange={(e) =>
                      setScheduleModal((prev) => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          delivery_instructions: e.target.value,
                        },
                      }))
                    }
                    placeholder="أدخل تعليمات خاصة بالتسليم..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <EnhancedButton
                    variant="outline"
                    onClick={() =>
                      setScheduleModal((prev) => ({ ...prev, isOpen: false }))
                    }
                  >
                    إلغاء
                  </EnhancedButton>
                  <EnhancedButton
                    variant="primary"
                    type="submit"
                    loading={scheduleModal.isLoading}
                  >
                    {scheduleModal.isEdit ? "تحديث" : "إنشاء"}
                  </EnhancedButton>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDeleteSchedule}
        title="تأكيد حذف الجدولة"
        message={`هل أنت متأكد من حذف جدولة التسليم: ${deleteModal.scheduleInfo}؟`}
        loading={deleteModal.isLoading}
      />
    </div>
  );
};

export default EnhancedDeliverySchedulingPage;
