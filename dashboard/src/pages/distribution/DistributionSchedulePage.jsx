/**
 * Distribution Schedule Page
 * Enhanced Distributor Management and Delivery Scheduling
 * Phase 6 - Complete Order Management
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// Services
import distributorService from "../../services/distributorService";
import orderService from "../../services/orderService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const DistributionSchedulePage = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [filters, setFilters] = useState({
    distributor_id: "",
    status: "all",
    priority: "all",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);

  // Load initial data
  useEffect(() => {
    loadTabData();
  }, [activeTab, selectedDate, filters]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "today":
          await loadTodaySchedules();
          break;
        case "upcoming":
          await loadUpcomingSchedules();
          break;
        case "pending":
          await loadPendingOrders();
          break;
        case "distributors":
          await loadDistributors();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const loadTodaySchedules = async () => {
    try {
      const response = await distributorService.getDistributorAssignments({
        date_from: selectedDate,
        date_to: selectedDate,
        status: "assigned,in_progress",
      });

      if (response.success) {
        setSchedules(response.data.assignments || []);
      }
    } catch (error) {
      console.error("Error loading today's schedules:", error);
      setSchedules([]);
      toast.error(
        "خطأ في تحميل جداول اليوم: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const loadUpcomingSchedules = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const response = await distributorService.getDistributorAssignments({
        date_from: tomorrow.toISOString().split("T")[0],
        date_to: nextWeek.toISOString().split("T")[0],
        status: "scheduled",
      });

      if (response.success) {
        setSchedules(response.data.assignments || []);
      }
    } catch (error) {
      console.error("Error loading upcoming schedules:", error);
      setSchedules([]);
      toast.error(
        "خطأ في تحميل الجداول القادمة: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const loadPendingOrders = async () => {
    try {
      const response = await orderService.getOrders({
        status: "confirmed",
        distributor_id: null,
        limit: 20,
      });

      if (response.success) {
        setPendingOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Error loading pending orders:", error);
      setPendingOrders([]);
      toast.error(
        "خطأ في تحميل الطلبات المعلقة: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const loadDistributors = async () => {
    try {
      const response = await distributorService.getDistributors({
        status: "active",
        limit: 10,
      });

      if (response.success) {
        setDistributors(response.data.distributors || []);
      }
    } catch (error) {
      console.error("Error loading distributors:", error);
      setDistributors([]);
      toast.error(
        "خطأ في تحميل الموزعين: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleOrderSelect = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkAssign = async () => {
    if (selectedOrders.length === 0) {
      toast.error("يرجى اختيار الطلبات المراد تعيينها");
      return;
    }

    if (!selectedDistributor) {
      toast.error("يرجى اختيار موزع");
      return;
    }

    setLoading(true);
    try {
      const response = await distributorService.bulkAssignDistributors({
        assignments: selectedOrders.map((orderId) => ({
          order_id: orderId,
          distributor_id: selectedDistributor.id,
          estimated_delivery: new Date().toISOString(),
          delivery_priority: "normal",
        })),
      });

      if (response.success) {
        toast.success(
          `تم تعيين ${response.data.successful_assignments} طلب بنجاح`
        );
        setSelectedOrders([]);
        setSelectedDistributor(null);
        setShowCreateModal(false);
        loadTabData();
      } else {
        toast.error("خطأ في تعيين الطلبات");
      }
    } catch (error) {
      console.error("Error bulk assigning:", error);
      toast.error("خطأ في تعيين الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleStatusUpdate = async (scheduleId, newStatus) => {
    try {
      const response = await distributorService.updateAssignmentStatus(
        scheduleId,
        {
          status: newStatus,
        }
      );

      if (response.success) {
        toast.success("تم تحديث حالة الجدول بنجاح");
        loadTabData();
      }
    } catch (error) {
      console.error("Error updating schedule status:", error);
      toast.error("خطأ في تحديث حالة الجدول");
    }
  };

  const clearFilters = () => {
    setFilters({
      distributor_id: "",
      status: "all",
      priority: "all",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">جدولة التوزيع</h1>
          <p className="text-gray-600 mt-1">إدارة الموزعين وجدولة التسليم</p>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center space-x-2 rtl:space-x-reverse"
          >
            <PlusIcon className="w-5 h-5" />
            <span>إنشاء جدول جديد</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
          {[
            { id: "today", label: "جدول اليوم", icon: CalendarIcon },
            { id: "upcoming", label: "الجدول القادم", icon: ClockIcon },
            {
              id: "pending",
              label: "الطلبات المعلقة",
              icon: ExclamationTriangleIcon,
            },
            { id: "distributors", label: "الموزعون", icon: UserGroupIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 rtl:space-x-reverse py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">الفلاتر</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            مسح الفلاتر
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              التاريخ
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الموزع
            </label>
            <select
              value={filters.distributor_id}
              onChange={(e) =>
                handleFilterChange("distributor_id", e.target.value)
              }
              className="select select-bordered w-full"
            >
              <option value="">جميع الموزعين</option>
              {distributors.map((distributor) => (
                <option key={distributor.id} value={distributor.id}>
                  {distributor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الحالة
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="all">جميع الحالات</option>
              <option value="assigned">مُعين</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {activeTab === "today" && (
            <TodaySchedulesTab
              schedules={schedules}
              onStatusUpdate={handleScheduleStatusUpdate}
            />
          )}
          {activeTab === "upcoming" && (
            <UpcomingSchedulesTab
              schedules={schedules}
              onStatusUpdate={handleScheduleStatusUpdate}
            />
          )}
          {activeTab === "pending" && (
            <PendingOrdersTab
              orders={pendingOrders}
              distributors={distributors}
              selectedOrders={selectedOrders}
              onOrderSelect={handleOrderSelect}
              onBulkAssign={handleBulkAssign}
            />
          )}
          {activeTab === "distributors" && (
            <DistributorsTab
              distributors={distributors}
              schedules={schedules}
            />
          )}
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <CreateScheduleModal
          orders={pendingOrders}
          distributors={distributors}
          selectedOrders={selectedOrders}
          selectedDistributor={selectedDistributor}
          onOrderSelect={handleOrderSelect}
          onDistributorSelect={setSelectedDistributor}
          onBulkAssign={handleBulkAssign}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

// Today Schedules Tab Component
const TodaySchedulesTab = ({ schedules, onStatusUpdate }) => {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          لا توجد جداول لليوم
        </h3>
        <p className="text-gray-600">لا توجد طلبات مُجدولة للتوزيع اليوم</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          onStatusUpdate={onStatusUpdate}
        />
      ))}
    </div>
  );
};

// Upcoming Schedules Tab Component
const UpcomingSchedulesTab = ({ schedules, onStatusUpdate }) => {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          لا توجد جداول قادمة
        </h3>
        <p className="text-gray-600">لا توجد طلبات مُجدولة للأسبوع القادم</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {schedules.map((schedule) => (
        <ScheduleCard
          key={schedule.id}
          schedule={schedule}
          onStatusUpdate={onStatusUpdate}
        />
      ))}
    </div>
  );
};

// Pending Orders Tab Component
const PendingOrdersTab = ({
  orders,
  distributors,
  selectedOrders,
  onOrderSelect,
  onBulkAssign,
}) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          لا توجد طلبات معلقة
        </h3>
        <p className="text-gray-600">جميع الطلبات تم تعيينها أو معالجتها</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          الطلبات المعلقة ({orders.length})
        </h3>
        {selectedOrders.length > 0 && (
          <button onClick={onBulkAssign} className="btn btn-primary">
            تعيين {selectedOrders.length} طلب
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            isSelected={selectedOrders.includes(order.id)}
            onSelect={() => onOrderSelect(order.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Distributors Tab Component
const DistributorsTab = ({ distributors, schedules }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {distributors.map((distributor) => (
        <DistributorCard
          key={distributor.id}
          distributor={distributor}
          schedules={schedules.filter(
            (s) => s.distributor_id === distributor.id
          )}
        />
      ))}
    </div>
  );
};

// Schedule Card Component
const ScheduleCard = ({ schedule, onStatusUpdate }) => {
  const statusInfo = distributorService.getAssignmentStatusInfo(
    schedule.status
  );
  const priorityInfo = distributorService.getDeliveryPriorityInfo(
    schedule.delivery_priority
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 border-l-4"
      style={{ borderLeftColor: statusInfo.color }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            طلب #{schedule.order_number}
          </h3>
          <p className="text-sm text-gray-600">{schedule.store_name}</p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: statusInfo.bgColor,
              color: statusInfo.color,
            }}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <UserGroupIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>{schedule.distributor_name}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <ClockIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>
            {new Date(schedule.estimated_delivery).toLocaleString("ar-SA")}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>{schedule.store_address}</span>
        </div>

        {schedule.notes && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {schedule.notes}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: priorityInfo.bgColor,
              color: priorityInfo.color,
            }}
          >
            {priorityInfo.label}
          </span>
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {schedule.status === "assigned" && (
            <button
              onClick={() => onStatusUpdate(schedule.id, "in_progress")}
              className="btn btn-sm btn-outline btn-primary"
            >
              بدء التوزيع
            </button>
          )}
          {schedule.status === "in_progress" && (
            <button
              onClick={() => onStatusUpdate(schedule.id, "completed")}
              className="btn btn-sm btn-outline btn-success"
            >
              إكمال التسليم
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Order Card Component
const OrderCard = ({ order, isSelected, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-md p-4 border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            طلب #{order.order_number}
          </h3>
          <p className="text-sm text-gray-600">{order.store_name}</p>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="checkbox checkbox-primary"
        />
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <ClockIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>{new Date(order.created_at).toLocaleDateString("ar-SA")}</span>
        </div>

        <div className="flex items-center">
          <MapPinIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>{order.store_address}</span>
        </div>

        <div className="flex items-center">
          <TruckIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>{order.total_amount_eur} EUR</span>
        </div>
      </div>
    </motion.div>
  );
};

// Distributor Card Component
const DistributorCard = ({ distributor, schedules }) => {
  const todaySchedules = schedules.filter((s) =>
    s.estimated_delivery?.startsWith(new Date().toISOString().split("T")[0])
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {distributor.name}
          </h3>
          <p className="text-sm text-gray-600">{distributor.email}</p>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            متاح
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <TruckIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>الطلبات اليوم: {todaySchedules.length}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <ChartBarIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>
            كفاءة: {distributor.performance_metrics?.efficiency_score || 0}%
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <CheckCircleIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>
            تسليمات مكتملة:{" "}
            {distributor.performance_metrics?.completed_deliveries || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Create Schedule Modal Component
const CreateScheduleModal = ({
  orders,
  distributors,
  selectedOrders,
  selectedDistributor,
  onOrderSelect,
  onDistributorSelect,
  onBulkAssign,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              إنشاء جدول توزيع جديد
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                اختيار الطلبات ({selectedOrders.length} محدد)
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedOrders.includes(order.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => onOrderSelect(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">طلب #{order.order_number}</p>
                        <p className="text-sm text-gray-600">
                          {order.store_name}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => onOrderSelect(order.id)}
                        className="checkbox checkbox-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distributor Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                اختيار الموزع
              </h3>
              <div className="space-y-2">
                {distributors.map((distributor) => (
                  <div
                    key={distributor.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedDistributor?.id === distributor.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => onDistributorSelect(distributor)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{distributor.name}</p>
                        <p className="text-sm text-gray-600">
                          {distributor.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          كفاءة:{" "}
                          {distributor.performance_metrics?.efficiency_score ||
                            0}
                          %
                        </p>
                      </div>
                      <input
                        type="radio"
                        name="distributor"
                        checked={selectedDistributor?.id === distributor.id}
                        onChange={() => onDistributorSelect(distributor)}
                        className="radio radio-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3 rtl:space-x-reverse">
          <button onClick={onClose} className="btn btn-outline">
            إلغاء
          </button>
          <button
            onClick={onBulkAssign}
            disabled={selectedOrders.length === 0 || !selectedDistributor}
            className="btn btn-primary"
          >
            إنشاء الجدول
          </button>
        </div>
      </div>
    </div>
  );
};

export default DistributionSchedulePage;
