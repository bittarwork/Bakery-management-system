/**
 * Distributor Management Page
 * Enhanced Distributor Assignment and Performance Management
 * Phase 6 - Complete Order Management
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  CalendarIcon,
  TruckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Services
import distributorService from "../../services/distributorService";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

const DistributorManagementPage = () => {
  const [activeTab, setActiveTab] = useState("distributors");
  const [loading, setLoading] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [distributorAnalytics, setDistributorAnalytics] = useState({});
  const [distributorCalendar, setDistributorCalendar] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "active",
    assignment_status: "",
    date_from: "",
    date_to: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Load initial data
  useEffect(() => {
    loadTabData();
  }, [activeTab, filters, pagination.currentPage]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "distributors":
          await loadDistributors();
          break;
        case "assignments":
          await loadAssignments();
          break;
        case "analytics":
          if (selectedDistributor) {
            await loadDistributorAnalytics(selectedDistributor.id);
          }
          break;
        case "calendar":
          if (selectedDistributor) {
            await loadDistributorCalendar(selectedDistributor.id);
          }
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

  const loadDistributors = async () => {
    try {
      const response = await distributorService.getDistributors({
        page: pagination.currentPage,
        search: filters.search,
        status: filters.status,
      });

      if (response.success) {
        setDistributors(response.data.distributors || []);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error("Error loading distributors:", error);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await distributorService.getDistributorAssignments({
        page: pagination.currentPage,
        status: filters.assignment_status,
        date_from: filters.date_from,
        date_to: filters.date_to,
        distributor_id: selectedDistributor?.id,
      });

      if (response.success) {
        setAssignments(response.data.assignments || []);
        setPagination(response.data.pagination || {});
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
    }
  };

  const loadDistributorAnalytics = async (distributorId) => {
    try {
      const response = await distributorService.getDistributorAnalytics(
        distributorId,
        {
          date_from: filters.date_from,
          date_to: filters.date_to,
        }
      );

      if (response.success) {
        setDistributorAnalytics(response.data || {});
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const loadDistributorCalendar = async (distributorId) => {
    try {
      const today = new Date();
      const response = await distributorService.getDistributorCalendar(
        distributorId,
        {
          month: today.getMonth() + 1,
          year: today.getFullYear(),
        }
      );

      if (response.success) {
        setDistributorCalendar(response.data.calendar_data || []);
      }
    } catch (error) {
      console.error("Error loading calendar:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleDistributorSelect = (distributor) => {
    setSelectedDistributor(distributor);
    if (activeTab === "analytics") {
      loadDistributorAnalytics(distributor.id);
    } else if (activeTab === "calendar") {
      loadDistributorCalendar(distributor.id);
    } else if (activeTab === "assignments") {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  };

  const handleAssignmentStatusUpdate = async (
    assignmentId,
    newStatus,
    actualDelivery = null
  ) => {
    try {
      const response = await distributorService.updateAssignmentStatus(
        assignmentId,
        {
          status: newStatus,
          actual_delivery: actualDelivery,
          notes: `تم تحديث الحالة إلى ${newStatus}`,
        }
      );

      if (response.success) {
        toast.success("تم تحديث حالة التعيين بنجاح");
        await loadAssignments();
      } else {
        toast.error("فشل في تحديث حالة التعيين");
      }
    } catch (error) {
      console.error("Error updating assignment status:", error);
      toast.error("خطأ في تحديث حالة التعيين");
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "active",
      assignment_status: "",
      date_from: "",
      date_to: "",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Tabs configuration
  const tabs = [
    {
      id: "distributors",
      name: "الموزعين",
      icon: UserGroupIcon,
      description: "إدارة الموزعين ومعلوماتهم",
    },
    {
      id: "assignments",
      name: "التعيينات",
      icon: ClipboardDocumentCheckIcon,
      description: "تتبع تعيينات الموزعين",
    },
    {
      id: "analytics",
      name: "التحليلات",
      icon: ChartBarIcon,
      description: "تحليلات أداء الموزعين",
    },
    {
      id: "calendar",
      name: "التقويم",
      icon: CalendarIcon,
      description: "تقويم مهام الموزعين",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              إدارة الموزعين
            </h1>
            <p className="text-gray-600">
              نظام إدارة الموزعين وتتبع الأداء والتعيينات
            </p>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 space-x-reverse bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                /* TODO: Open assign modal */
              }}
            >
              <PlusIcon className="w-5 h-5" />
              <span>تعيين جديد</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 space-x-reverse py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-4 mb-6"
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          {activeTab === "distributors" && (
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          )}

          {/* Assignment Status Filter */}
          {activeTab === "assignments" && (
            <select
              value={filters.assignment_status}
              onChange={(e) =>
                handleFilterChange("assignment_status", e.target.value)
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع التعيينات</option>
              <option value="assigned">معين</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          )}

          {/* Distributor Selector for Analytics/Calendar */}
          {(activeTab === "analytics" ||
            activeTab === "calendar" ||
            activeTab === "assignments") && (
            <select
              value={selectedDistributor?.id || ""}
              onChange={(e) => {
                const distributor = distributors.find(
                  (d) => d.id === parseInt(e.target.value)
                );
                handleDistributorSelect(distributor);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">اختر موزع...</option>
              {distributors.map((distributor) => (
                <option key={distributor.id} value={distributor.id}>
                  {distributor.name}
                </option>
              ))}
            </select>
          )}

          {/* Date Range */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">إلى</span>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            مسح المرشحات
          </button>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm min-h-96">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6">
            {/* Distributors Tab */}
            {activeTab === "distributors" && (
              <DistributorsTab
                distributors={distributors}
                pagination={pagination}
                onPageChange={(page) =>
                  setPagination((prev) => ({ ...prev, currentPage: page }))
                }
                onDistributorSelect={handleDistributorSelect}
              />
            )}

            {/* Assignments Tab */}
            {activeTab === "assignments" && (
              <AssignmentsTab
                assignments={assignments}
                pagination={pagination}
                selectedDistributor={selectedDistributor}
                onPageChange={(page) =>
                  setPagination((prev) => ({ ...prev, currentPage: page }))
                }
                onStatusUpdate={handleAssignmentStatusUpdate}
              />
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <AnalyticsTab
                analytics={distributorAnalytics}
                distributor={selectedDistributor}
              />
            )}

            {/* Calendar Tab */}
            {activeTab === "calendar" && (
              <CalendarTab
                calendar={distributorCalendar}
                distributor={selectedDistributor}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Distributors Tab Component
const DistributorsTab = ({
  distributors,
  pagination,
  onPageChange,
  onDistributorSelect,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          الموزعين ({distributors.length})
        </h3>
      </div>

      {distributors.length === 0 ? (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد موزعين</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {distributors.map((distributor) => (
            <DistributorCard
              key={distributor.id}
              distributor={distributor}
              onSelect={() => onDistributorSelect(distributor)}
            />
          ))}

          {pagination.totalPages > 1 && (
            <div className="col-span-full mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Distributor Card Component
const DistributorCard = ({ distributor, onSelect }) => {
  const availabilityInfo = distributorService.getAvailabilityStatusInfo(
    distributor.performance_metrics?.active_assignments > 10
      ? "overloaded"
      : distributor.performance_metrics?.active_assignments > 5
      ? "busy"
      : "available"
  );

  const performanceColor = distributorService.getPerformanceScoreColor(
    distributor.performance_metrics?.efficiency_score || 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{distributor.name}</h4>
            <p className="text-sm text-gray-500">{distributor.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <span
            className={`px-2 py-1 rounded-full text-xs ${availabilityInfo.bgColor} ${availabilityInfo.color}`}
          >
            {availabilityInfo.icon} {availabilityInfo.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">التعيينات النشطة:</span>
          <span className="font-semibold text-gray-900 mr-2">
            {distributor.performance_metrics?.active_assignments || 0}
          </span>
        </div>
        <div>
          <span className="text-gray-500">المكتملة:</span>
          <span className="font-semibold text-green-600 mr-2">
            {distributor.performance_metrics?.completed_deliveries || 0}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-sm text-gray-500">نقاط الأداء:</span>
          <span className={`font-semibold ${performanceColor}`}>
            {distributor.performance_metrics?.efficiency_score || 0}%
          </span>
        </div>

        {distributor.phone && (
          <span className="text-xs text-gray-400">{distributor.phone}</span>
        )}
      </div>
    </motion.div>
  );
};

// Assignments Tab Component
const AssignmentsTab = ({
  assignments,
  pagination,
  selectedDistributor,
  onPageChange,
  onStatusUpdate,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          التعيينات {selectedDistributor ? `- ${selectedDistributor.name}` : ""}{" "}
          ({assignments.length})
        </h3>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد تعيينات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={distributorService.formatAssignmentForDisplay(
                assignment
              )}
              onStatusUpdate={onStatusUpdate}
            />
          ))}

          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment, onStatusUpdate }) => {
  const handleStatusChange = (newStatus) => {
    const actualDelivery =
      newStatus === "completed" ? new Date().toISOString() : null;
    onStatusUpdate(assignment.id, newStatus, actualDelivery);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 space-x-reverse">
          <TruckIcon className="w-6 h-6 text-blue-600" />
          <div>
            <h4 className="font-semibold text-gray-900">
              طلب #{assignment.order_number}
            </h4>
            <p className="text-sm text-gray-500">{assignment.store_name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <span
            className={`px-2 py-1 rounded-full text-xs ${assignment.statusInfo.bgColor} ${assignment.statusInfo.color}`}
          >
            {assignment.statusInfo.label}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${assignment.priorityInfo.bgColor} ${assignment.priorityInfo.color}`}
          >
            {assignment.priorityInfo.icon} {assignment.priorityInfo.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <span className="text-gray-500">الموزع:</span>
          <span className="font-medium text-gray-900 mr-2">
            {assignment.distributor_name}
          </span>
        </div>
        <div>
          <span className="text-gray-500">قيمة الطلب:</span>
          <span className="font-medium text-gray-900 mr-2">
            €{parseFloat(assignment.total_amount_eur || 0).toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">التسليم المتوقع:</span>
          <span className="font-medium text-gray-900 mr-2">
            {assignment.estimated_delivery
              ? new Date(assignment.estimated_delivery).toLocaleString("ar-AE")
              : "غير محدد"}
          </span>
        </div>
        <div>
          <span className="text-gray-500">حالة التأخير:</span>
          <span className={`font-medium mr-2 ${assignment.delayInfo.color}`}>
            {assignment.delayInfo.text}
          </span>
        </div>
      </div>

      {assignment.notes && (
        <div className="mb-3">
          <span className="text-sm text-gray-500">ملاحظات: </span>
          <span className="text-sm text-gray-700">{assignment.notes}</span>
        </div>
      )}

      {/* Quick Action Buttons */}
      {assignment.status === "assigned" && (
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => handleStatusChange("in_progress")}
            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
          >
            بدء التنفيذ
          </button>
          <button
            onClick={() => handleStatusChange("completed")}
            className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors"
          >
            تم التسليم
          </button>
        </div>
      )}

      {assignment.status === "in_progress" && (
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => handleStatusChange("completed")}
            className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors"
          >
            تم التسليم
          </button>
        </div>
      )}
    </motion.div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ analytics, distributor }) => {
  if (!distributor) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">يرجى اختيار موزع لعرض التحليلات</p>
      </div>
    );
  }

  const metrics = analytics.metrics || {};
  const dailyPerformance = analytics.daily_performance || [];
  const recentAssignments = analytics.recent_assignments || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          تحليلات أداء {distributor.name}
        </h3>
        <div className="text-sm text-gray-500">
          {analytics.period?.from} إلى {analytics.period?.to}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="إجمالي التعيينات"
          value={metrics.total_assignments || 0}
          icon={ClipboardDocumentCheckIcon}
          color="blue"
        />
        <MetricCard
          title="المكتملة"
          value={metrics.completed_assignments || 0}
          icon={CheckCircleIcon}
          color="green"
        />
        <MetricCard
          title="معدل الإنجاز"
          value={`${metrics.completion_rate?.toFixed(1) || 0}%`}
          icon={ChartBarIcon}
          color="purple"
        />
        <MetricCard
          title="في الوقت المحدد"
          value={`${metrics.on_time_rate?.toFixed(1) || 0}%`}
          icon={ClockIcon}
          color="orange"
        />
      </div>

      {/* Recent Assignments */}
      {recentAssignments.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-4">آخر التعيينات</h4>
          <div className="space-y-3">
            {recentAssignments.slice(0, 5).map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <span className="font-medium">
                    طلب #{assignment.order_number}
                  </span>
                  <span className="text-sm text-gray-500 mr-3">
                    {assignment.store_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      assignment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : assignment.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {
                      distributorService.getAssignmentStatusInfo(
                        assignment.status
                      ).label
                    }
                  </span>
                  <span className="text-sm text-gray-500">
                    €{parseFloat(assignment.total_amount_eur || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Performance Chart Placeholder */}
      {dailyPerformance.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-4">الأداء اليومي</h4>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">رسم بياني للأداء اليومي</p>
            <p className="text-xs text-gray-400 mt-2">
              {dailyPerformance.length} نقطة بيانات متاحة
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Calendar Tab Component
const CalendarTab = ({ calendar, distributor }) => {
  if (!distributor) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">يرجى اختيار موزع لعرض التقويم</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">تقويم {distributor.name}</h3>
      </div>

      {calendar.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">لا توجد مهام في التقويم</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {calendar.map((day) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">
                  {new Date(day.date).toLocaleDateString("ar-AE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h4>
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                  <span>إجمالي: {day.total_assignments}</span>
                  <span>مكتمل: {day.completed_assignments}</span>
                </div>
              </div>

              {day.assignments && day.assignments.length > 0 && (
                <div className="space-y-2">
                  {day.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="font-medium">
                          طلب #{assignment.order_number}
                        </span>
                        <span className="text-sm text-gray-500">
                          {assignment.store_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            assignment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : assignment.status === "in_progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {
                            distributorService.getAssignmentStatusInfo(
                              assignment.status
                            ).label
                          }
                        </span>
                        <span className="text-sm text-gray-500">
                          €{parseFloat(assignment.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-4 rounded-lg border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2 space-x-reverse">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        السابق
      </button>

      <span className="px-3 py-2 text-sm text-gray-700">
        الصفحة {currentPage} من {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        التالي
      </button>
    </div>
  );
};

export default DistributorManagementPage;
