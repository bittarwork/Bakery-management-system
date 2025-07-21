/**
 * Distribution Tracking Page
 * Real-time Distribution Tracking and Monitoring
 * Phase 6 - Complete Order Management
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  MapPinIcon,
  TruckIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

// Services
import distributorService from "../../services/distributorService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const DistributionTrackingPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeDistributors, setActiveDistributors] = useState([]);
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [trackingData, setTrackingData] = useState({});
  const [filters, setFilters] = useState({
    status: "all",
    area: "all",
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load initial data
  useEffect(() => {
    loadActiveDistributors();

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadActiveDistributors();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  const loadActiveDistributors = async () => {
    setLoading(true);
    try {
      const response = await distributorService.getDistributorAssignments({
        status: "in_progress",
        page: 1,
        limit: 50,
      });

      if (response.success) {
        const activeAssignments = response.data.assignments || [];

        // Group by distributor
        const distributorMap = {};
        activeAssignments.forEach((assignment) => {
          if (!distributorMap[assignment.distributor_id]) {
            distributorMap[assignment.distributor_id] = {
              distributor: {
                id: assignment.distributor_id,
                name: assignment.distributor_name,
                email: assignment.distributor_email,
                phone: assignment.distributor_phone,
              },
              assignments: [],
              currentLocation: null,
              status: "active",
            };
          }
          distributorMap[assignment.distributor_id].assignments.push(
            assignment
          );
        });

        setActiveDistributors(Object.values(distributorMap));

        // Load tracking data for each distributor
        Object.values(distributorMap).forEach(async (distributorData) => {
          await loadDistributorTracking(distributorData.distributor.id);
        });
      }
    } catch (error) {
      console.error("Error loading active distributors:", error);
      // استخدام بيانات تجريبية للموزعين النشطين
      const mockActiveDistributors = [
        {
          distributor: {
            id: 1,
            name: "أحمد محمد",
            email: "ahmed@bakery.com",
            phone: "+32 456 123 789",
          },
          assignments: [
            {
              id: 1,
              order_number: "ORD-2024-101",
              store_name: "متجر الأمين",
              status: "in_progress",
              delivery_priority: "high",
              estimated_delivery: "2024-01-20 14:00",
            },
          ],
          currentLocation: {
            lat: 50.8503,
            lng: 4.3517,
            address: "Brussels Center",
            lastUpdate: new Date().toISOString(),
          },
          status: "active",
        },
        {
          distributor: {
            id: 2,
            name: "محمد علي",
            email: "mohamed@bakery.com",
            phone: "+32 465 789 123",
          },
          assignments: [
            {
              id: 2,
              order_number: "ORD-2024-102",
              store_name: "مخبز النور",
              status: "in_progress",
              delivery_priority: "normal",
              estimated_delivery: "2024-01-20 16:30",
            },
          ],
          currentLocation: {
            lat: 51.2194,
            lng: 4.4025,
            address: "Antwerp Center",
            lastUpdate: new Date().toISOString(),
          },
          status: "active",
        },
      ];

      setActiveDistributors(mockActiveDistributors);
      toast.error("تم استخدام بيانات تجريبية - مشكلة في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const loadDistributorTracking = async (distributorId) => {
    try {
      const response = await distributorService.getDistributorAnalytics(
        distributorId,
        {
          include_location: true,
          include_assignments: true,
        }
      );

      if (response.success) {
        setTrackingData((prev) => ({
          ...prev,
          [distributorId]: response.data,
        }));
      }
    } catch (error) {
      console.error(
        `Error loading tracking for distributor ${distributorId}:`,
        error
      );
    }
  };

  const handleDistributorSelect = (distributor) => {
    setSelectedDistributor(distributor);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleManualRefresh = () => {
    loadActiveDistributors();
    toast.success("تم تحديث البيانات");
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    if (autoRefresh && refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "busy":
        return "text-yellow-600 bg-yellow-100";
      case "offline":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getDeliveryProgress = (assignments) => {
    const total = assignments.length;
    const completed = assignments.filter(
      (a) => a.status === "completed"
    ).length;
    const inProgress = assignments.filter(
      (a) => a.status === "in_progress"
    ).length;

    return {
      total,
      completed,
      inProgress,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            تتبع التوزيع المباشر
          </h1>
          <p className="text-gray-600 mt-1">
            مراقبة الموزعين والطلبات في الوقت الفعلي
          </p>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={toggleAutoRefresh}
            className={`btn btn-sm ${
              autoRefresh ? "btn-primary" : "btn-outline"
            }`}
          >
            <ArrowPathIcon className="w-4 h-4 mr-2 rtl:ml-2" />
            {autoRefresh ? "إيقاف التحديث التلقائي" : "تشغيل التحديث التلقائي"}
          </button>
          <button
            onClick={handleManualRefresh}
            className="btn btn-outline btn-sm"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="الموزعون النشطون"
          value={activeDistributors.length}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatsCard
          title="الطلبات قيد التنفيذ"
          value={activeDistributors.reduce(
            (total, d) => total + d.assignments.length,
            0
          )}
          icon={TruckIcon}
          color="green"
        />
        <StatsCard
          title="التسليمات المكتملة اليوم"
          value={activeDistributors.reduce((total, d) => {
            const progress = getDeliveryProgress(d.assignments);
            return total + progress.completed;
          }, 0)}
          icon={CheckCircleIcon}
          color="purple"
        />
        <StatsCard
          title="معدل الإنجاز"
          value={`${Math.round(
            activeDistributors.reduce((total, d) => {
              const progress = getDeliveryProgress(d.assignments);
              return total + progress.percentage;
            }, 0) / Math.max(activeDistributors.length, 1)
          )}%`}
          icon={ChartBarIcon}
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">الفلاتر</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              حالة الموزع
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="busy">مشغول</option>
              <option value="offline">غير متصل</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المنطقة
            </label>
            <select
              value={filters.area}
              onChange={(e) => handleFilterChange("area", e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="all">جميع المناطق</option>
              <option value="damascus">دمشق</option>
              <option value="aleppo">حلب</option>
              <option value="latakia">اللاذقية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distributors List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  الموزعون النشطون ({activeDistributors.length})
                </h3>
              </div>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {activeDistributors.length === 0 ? (
                  <div className="text-center py-8">
                    <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      لا يوجد موزعون نشطون
                    </h3>
                    <p className="text-gray-600">
                      لا يوجد موزعون يعملون حالياً
                    </p>
                  </div>
                ) : (
                  activeDistributors.map((distributorData) => (
                    <DistributorCard
                      key={distributorData.distributor.id}
                      distributorData={distributorData}
                      isSelected={
                        selectedDistributor?.id ===
                        distributorData.distributor.id
                      }
                      onSelect={() =>
                        handleDistributorSelect(distributorData.distributor)
                      }
                      trackingData={
                        trackingData[distributorData.distributor.id]
                      }
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tracking Details */}
          <div className="lg:col-span-2">
            {selectedDistributor ? (
              <TrackingDetailsCard
                distributor={selectedDistributor}
                assignments={
                  activeDistributors.find(
                    (d) => d.distributor.id === selectedDistributor.id
                  )?.assignments || []
                }
                trackingData={trackingData[selectedDistributor.id]}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  اختر موزعاً لعرض التفاصيل
                </h3>
                <p className="text-gray-600">
                  اختر موزعاً من القائمة لعرض تفاصيل التتبع والموقع
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="mr-4 rtl:ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Distributor Card Component
const DistributorCard = ({
  distributorData,
  isSelected,
  onSelect,
  trackingData,
}) => {
  const progress = getDeliveryProgress(distributorData.assignments);
  const statusColor = getStatusColor(distributorData.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">
            {distributorData.distributor.name}
          </h4>
          <p className="text-sm text-gray-600">
            {distributorData.distributor.email}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}
        >
          {distributorData.status === "active"
            ? "نشط"
            : distributorData.status === "busy"
            ? "مشغول"
            : "غير متصل"}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <TruckIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>الطلبات: {distributorData.assignments.length}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <CheckCircleIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>
            مكتمل: {progress.completed}/{progress.total}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>

        {trackingData?.current_location && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-2 rtl:ml-2" />
            <span>آخر موقع: {trackingData.current_location.address}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Tracking Details Card Component
const TrackingDetailsCard = ({ distributor, assignments, trackingData }) => {
  const progress = getDeliveryProgress(assignments);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {distributor.name}
            </h3>
            <p className="text-gray-600">{distributor.email}</p>
          </div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <button className="btn btn-sm btn-outline">
              <PhoneIcon className="w-4 h-4 mr-2 rtl:ml-2" />
              اتصال
            </button>
            <button className="btn btn-sm btn-outline">
              <EnvelopeIcon className="w-4 h-4 mr-2 rtl:ml-2" />
              رسالة
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Overview */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              نظرة عامة على التقدم
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">إجمالي الطلبات</span>
                <span className="font-semibold">{progress.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">مكتمل</span>
                <span className="font-semibold text-green-600">
                  {progress.completed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">قيد التنفيذ</span>
                <span className="font-semibold text-blue-600">
                  {progress.inProgress}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <div className="text-center">
                <span className="text-lg font-bold text-gray-900">
                  {progress.percentage}%
                </span>
                <span className="text-sm text-gray-600"> مكتمل</span>
              </div>
            </div>
          </div>

          {/* Current Location */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              الموقع الحالي
            </h4>
            {trackingData?.current_location ? (
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPinIcon className="w-4 h-4 mr-2 rtl:ml-2" />
                    <span>العنوان</span>
                  </div>
                  <p className="font-medium">
                    {trackingData.current_location.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500">خط العرض</div>
                    <div className="font-medium">
                      {trackingData.current_location.latitude}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500">خط الطول</div>
                    <div className="font-medium">
                      {trackingData.current_location.longitude}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">آخر تحديث</div>
                  <div className="font-medium">
                    {new Date(
                      trackingData.current_location.timestamp
                    ).toLocaleString("ar-SA")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد بيانات موقع متاحة</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Assignments */}
        <div className="mt-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            الطلبات الحالية
          </h4>
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment }) => {
  const statusInfo = distributorService.getAssignmentStatusInfo(
    assignment.status
  );

  return (
    <div
      className="bg-gray-50 rounded-lg p-4 border-l-4"
      style={{ borderLeftColor: statusInfo.color }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h5 className="font-medium text-gray-900">
            طلب #{assignment.order_number}
          </h5>
          <p className="text-sm text-gray-600">{assignment.store_name}</p>
          <p className="text-sm text-gray-600">{assignment.store_address}</p>
        </div>
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

      <div className="mt-3 flex items-center text-sm text-gray-600">
        <ClockIcon className="w-4 h-4 mr-2 rtl:ml-2" />
        <span>
          موعد التسليم:{" "}
          {new Date(assignment.estimated_delivery).toLocaleString("ar-SA")}
        </span>
      </div>
    </div>
  );
};

// Helper function
const getDeliveryProgress = (assignments) => {
  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "completed").length;
  const inProgress = assignments.filter(
    (a) => a.status === "in_progress"
  ).length;

  return {
    total,
    completed,
    inProgress,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

export default DistributionTrackingPage;
