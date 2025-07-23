import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  CpuChipIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  EyeIcon,
  ClockIcon,
  TruckIcon,
  UserGroupIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  BellAlertIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Services
import autoSchedulingService from "../../services/autoSchedulingService";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";

const AutoSchedulingReviewPage = () => {
  const [loading, setLoading] = useState(false);
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [error, setError] = useState("");

  // Filter states with enhanced options
  const [filters, setFilters] = useState({
    status: "pending_review",
    min_confidence: "",
    max_confidence: "",
    date_from: "",
    date_to: "",
    store_search: "",
    distributor_search: "",
  });

  // Pagination with enhanced controls
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 15, // Increased for better productivity
  });

  // Review form states with validation
  const [reviewForm, setReviewForm] = useState({
    action: "",
    modifications: {
      distributor_id: "",
      delivery_date: "",
      priority: "",
    },
    admin_notes: "",
    create_distribution_trip: true,
  });

  // Load initial data with error handling
  useEffect(() => {
    loadInitialData();
  }, [filters, pagination.currentPage]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadPendingDrafts(),
        loadStatistics(),
        loadDistributors(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("خطأ في تحميل البيانات الأولية");
    }
  };

  const loadPendingDrafts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await autoSchedulingService.getPendingReviews({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        status: filters.status,
      });

      if (response.success) {
        const formattedDrafts = response.data.drafts.map((draft) =>
          autoSchedulingService.formatDraftForDisplay(draft)
        );
        setPendingDrafts(formattedDrafts);

        if (response.data.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...response.data.pagination,
          }));
        }
      } else {
        setError(response.message || "خطأ في تحميل المسودات");
        setPendingDrafts([]);
      }
    } catch (error) {
      console.error("Error loading pending drafts:", error);
      setError("خطأ في الاتصال بالخادم");
      setPendingDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await autoSchedulingService.getSchedulingStatistics(
        "month"
      );
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const loadDistributors = async () => {
    try {
      const response = await userService.getUsers({
        role: "distributor",
        status: "active",
        limit: 100,
      });
      if (response.success) {
        setDistributors(response.data?.users || response.data || []);
      }
    } catch (error) {
      console.error("Error loading distributors:", error);
    }
  };

  const handleDraftSelect = async (draft) => {
    try {
      setLoading(true);
      const response = await autoSchedulingService.getSchedulingDraft(draft.id);
      if (response.success) {
        const formattedDraft = autoSchedulingService.formatDraftForDisplay(
          response.data
        );
        setSelectedDraft(formattedDraft);
        setReviewForm({
          action: "",
          modifications: {
            distributor_id: draft.suggested_distributor_id,
            delivery_date: draft.suggested_delivery_date,
            priority: draft.suggested_priority,
          },
          admin_notes: "",
          create_distribution_trip: true,
        });
        setShowReviewModal(true);
      } else {
        toast.error(response.message || "خطأ في جلب تفاصيل المسودة");
      }
    } catch (error) {
      console.error("Error loading draft details:", error);
      toast.error("خطأ في جلب تفاصيل المسودة");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedDraft || !reviewForm.action) {
      toast.error("يرجى اختيار إجراء");
      return;
    }

    // Validation for reject action
    if (reviewForm.action === "reject" && !reviewForm.admin_notes.trim()) {
      toast.error("سبب الرفض مطلوب");
      return;
    }

    setLoading(true);
    try {
      let response;

      if (reviewForm.action === "approve") {
        // Check if there are modifications
        const hasModifications =
          reviewForm.modifications.distributor_id !==
            selectedDraft.suggested_distributor_id ||
          reviewForm.modifications.delivery_date !==
            selectedDraft.suggested_delivery_date ||
          reviewForm.modifications.priority !==
            selectedDraft.suggested_priority;

        response = await autoSchedulingService.approveSchedulingDraft(
          selectedDraft.id,
          {
            modifications: hasModifications ? reviewForm.modifications : null,
            admin_notes: reviewForm.admin_notes,
            create_distribution_trip: reviewForm.create_distribution_trip,
          }
        );
      } else if (reviewForm.action === "reject") {
        response = await autoSchedulingService.rejectSchedulingDraft(
          selectedDraft.id,
          reviewForm.admin_notes,
          false
        );
      }

      if (response.success) {
        toast.success(response.message || "تم تحديث المسودة بنجاح");
        setShowReviewModal(false);
        setSelectedDraft(null);
        await loadInitialData(); // Reload all data
      } else {
        toast.error(response.message || "خطأ في تحديث المسودة");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("خطأ في تحديث المسودة");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced confidence badge with better styling
  const getConfidenceBadge = (score, level) => {
    const colorClasses = {
      green: "bg-green-100 text-green-800 border-green-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };

    const color = autoSchedulingService.getConfidenceColor(score);

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
          colorClasses[color] || colorClasses.gray
        }`}
      >
        <SparklesIcon className="w-3 h-3 ml-1" />
        {score}% - {level}
      </span>
    );
  };

  // Enhanced status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_review: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: ClockIcon,
        text: "في انتظار المراجعة",
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircleIcon,
        text: "معتمد",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircleIcon,
        text: "مرفوض",
      },
      modified: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: PencilSquareIcon,
        text: "معتمد مع تعديلات",
      },
    };

    const config = statusConfig[status] || statusConfig.pending_review;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}
      >
        <Icon className="w-3 h-3 ml-1" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <CpuChipIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                مراجعة الجدولة التلقائية
              </h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <InformationCircleIcon className="w-4 h-4 ml-2" />
                مراجعة واعتماد اقتراحات النظام الذكي للتوزيع
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <EnhancedButton
              onClick={() => setShowStatsModal(true)}
              variant="outline"
              size="md"
              icon={<ChartBarIcon className="w-5 h-5" />}
            >
              الإحصائيات
            </EnhancedButton>
            <EnhancedButton
              onClick={loadInitialData}
              variant="primary"
              size="md"
              icon={
                <ArrowPathIcon
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              }
              disabled={loading}
            >
              تحديث
            </EnhancedButton>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-yellow-100">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-yellow-500 rounded-lg shadow-md">
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-700">
                      في الانتظار
                    </p>
                    <p className="text-3xl font-bold text-yellow-900">
                      {
                        pendingDrafts.filter(
                          (d) => d.status === "pending_review"
                        ).length
                      }
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">مسودة معلقة</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-green-500 rounded-lg shadow-md">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-700">
                      معتمد هذا الشهر
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {statistics.accuracy_metrics?.approved_without_changes ||
                        0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">اقتراح معتمد</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-500 rounded-lg shadow-md">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-700">
                      متوسط الثقة
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {statistics.accuracy_metrics?.average_confidence || 0}%
                    </p>
                    <p className="text-xs text-blue-600 mt-1">درجة الثقة</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-purple-50 to-purple-100">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-purple-500 rounded-lg shadow-md">
                    <TruckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-700">
                      معدل الدقة
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {statistics.accuracy_metrics?.approval_rate || 0}%
                    </p>
                    <p className="text-xs text-purple-600 mt-1">نسبة النجاح</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Filters */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gray-50">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                خيارات التصفية
              </h3>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {autoSchedulingService.getStatusOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أقل درجة ثقة
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.min_confidence}
                  onChange={(e) =>
                    setFilters({ ...filters, min_confidence: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أعلى درجة ثقة
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.max_confidence}
                  onChange={(e) =>
                    setFilters({ ...filters, max_confidence: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  من تاريخ
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) =>
                    setFilters({ ...filters, date_from: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إلى تاريخ
                </label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) =>
                    setFilters({ ...filters, date_to: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <EnhancedButton
                  onClick={() =>
                    setFilters({
                      status: "pending_review",
                      min_confidence: "",
                      max_confidence: "",
                      date_from: "",
                      date_to: "",
                      store_search: "",
                      distributor_search: "",
                    })
                  }
                  variant="outline"
                  size="md"
                  className="w-full"
                >
                  مسح الفلاتر
                </EnhancedButton>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 ml-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Enhanced Main Content */}
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <DocumentTextIcon className="w-6 h-6" />
                <h3 className="text-xl font-bold">المسودات المعلقة</h3>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <BellAlertIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {pendingDrafts.length} مسودة تحتاج مراجعة
                </span>
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-0">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">جاري تحميل المسودات...</p>
              </div>
            ) : pendingDrafts.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <CpuChipIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  لا توجد مسودات معلقة
                </h3>
                <p className="text-gray-600 mb-6">
                  جميع الاقتراحات تمت مراجعتها أو لا توجد طلبات جديدة
                </p>
                <EnhancedButton
                  onClick={loadInitialData}
                  variant="primary"
                  icon={<ArrowPathIcon className="w-4 h-4" />}
                >
                  تحديث القائمة
                </EnhancedButton>
              </div>
            ) : (
              <div className="relative">
                {/* Fixed Table Header */}
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                            رقم الطلب
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-48">
                            المحل
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-44">
                            الموزع المقترح
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                            درجة الثقة
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                            تاريخ التسليم
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                            القيمة
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                            الحالة
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                </div>

                {/* Scrollable Table Body */}
                <div className="overflow-x-auto max-h-96 overflow-y-auto border-t border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody className="bg-white divide-y divide-gray-200">
                      <AnimatePresence>
                        {pendingDrafts.map((draft, index) => (
                          <motion.tr
                            key={draft.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap w-32">
                              <div className="text-sm font-semibold text-gray-900">
                                {draft.order_number}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(draft.created_at).toLocaleDateString(
                                  "ar-SA"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 min-w-48">
                              <div className="text-sm font-medium text-gray-900">
                                {draft.store_name}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <MapPinIcon className="w-3 h-3 ml-1" />
                                <span className="truncate max-w-xs">
                                  {draft.store_address}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap min-w-44">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                                  <UserGroupIcon className="w-4 h-4 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {draft.suggested_distributor_full_name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {draft.distributor_phone}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-32">
                              {getConfidenceBadge(
                                draft.confidence_score,
                                draft.confidence_level
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-32">
                              <div className="flex items-center text-sm text-gray-900">
                                <CalendarDaysIcon className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                                <span className="truncate">
                                  {draft.formatted_date}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-32">
                              <div className="flex items-center text-sm font-semibold text-gray-900">
                                <CurrencyEuroIcon className="w-4 h-4 text-gray-400 ml-1 flex-shrink-0" />
                                <span className="truncate">
                                  {draft.formatted_amount_eur}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap w-32">
                              {getStatusBadge(draft.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right w-28">
                              <EnhancedButton
                                onClick={() => handleDraftSelect(draft)}
                                variant="primary"
                                size="sm"
                                icon={<EyeIcon className="w-4 h-4" />}
                                disabled={loading}
                              >
                                مراجعة
                              </EnhancedButton>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Summary Row */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      إجمالي المسودات المعروضة:{" "}
                      <strong>{pendingDrafts.length}</strong>
                    </span>
                    <span>
                      آخر تحديث:{" "}
                      <strong>{new Date().toLocaleTimeString("ar-SA")}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Enhanced Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-md border">
            <div className="text-sm text-gray-700">
              عرض {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
              إلى{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              من {pagination.totalItems} نتيجة
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <EnhancedButton
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }))
                }
                disabled={pagination.currentPage === 1 || loading}
                variant="outline"
                size="sm"
              >
                السابق
              </EnhancedButton>

              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const pageNum = pagination.currentPage - 2 + i;
                    if (pageNum < 1 || pageNum > pagination.totalPages)
                      return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: pageNum,
                          }))
                        }
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                          pageNum === pagination.currentPage
                            ? "bg-purple-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <EnhancedButton
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
                disabled={
                  pagination.currentPage === pagination.totalPages || loading
                }
                variant="outline"
                size="sm"
              >
                التالي
              </EnhancedButton>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedDraft && (
          <ReviewModal
            draft={selectedDraft}
            distributors={distributors}
            reviewForm={reviewForm}
            setReviewForm={setReviewForm}
            onSubmit={handleReviewSubmit}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedDraft(null);
            }}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

// Enhanced Review Modal Component with better UX
const ReviewModal = ({
  draft,
  distributors,
  reviewForm,
  setReviewForm,
  onSubmit,
  onClose,
  loading,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  مراجعة اقتراح الجدولة
                </h2>
                <p className="text-gray-600 mt-1">
                  الطلب رقم: {draft.order_number}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Draft Details Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <InformationCircleIcon className="w-5 h-5 ml-2 text-blue-500" />
                  تفاصيل الاقتراح
                </h3>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        درجة الثقة:
                      </span>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          <SparklesIcon className="w-4 h-4 ml-1" />
                          {draft.confidence_score_display} -{" "}
                          {draft.confidence_level}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        الموزع المقترح:
                      </span>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {draft.suggested_distributor_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        تاريخ التسليم:
                      </span>
                      <p className="mt-1 text-sm font-semibold text-gray-900 flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 ml-1 text-gray-400" />
                        {draft.formatted_date}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        الأولوية:
                      </span>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {autoSchedulingService.getPriorityDisplayName(
                          draft.suggested_priority
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      قيمة الطلب:
                    </span>
                    <p className="mt-1 text-lg font-bold text-gray-900 flex items-center">
                      <CurrencyEuroIcon className="w-5 h-5 ml-1 text-gray-400" />
                      {draft.formatted_amount_eur}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <DocumentTextIcon className="w-4 h-4 ml-1 text-gray-500" />
                    أسباب الاختيار:
                  </h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 leading-relaxed">
                      {draft.reasoning_text ||
                        "تحليل النظام الذكي للمعايير المختلفة"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Form Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PencilSquareIcon className="w-5 h-5 ml-2 text-green-500" />
                  إجراء المراجعة
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      اختر الإجراء المطلوب
                    </label>
                    <div className="space-y-3">
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          reviewForm.action === "approve"
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="action"
                          value="approve"
                          checked={reviewForm.action === "approve"}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              action: e.target.value,
                            })
                          }
                          className="sr-only"
                        />
                        <CheckCircleIcon className="w-6 h-6 text-green-500 ml-3" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            اعتماد الاقتراح
                          </div>
                          <div className="text-sm text-gray-600">
                            الموافقة على الاقتراح كما هو أو مع تعديلات
                          </div>
                        </div>
                      </motion.label>

                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          reviewForm.action === "reject"
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-red-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="action"
                          value="reject"
                          checked={reviewForm.action === "reject"}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              action: e.target.value,
                            })
                          }
                          className="sr-only"
                        />
                        <XCircleIcon className="w-6 h-6 text-red-500 ml-3" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            رفض الاقتراح
                          </div>
                          <div className="text-sm text-gray-600">
                            رفض الاقتراح وطلب مراجعة يدوية
                          </div>
                        </div>
                      </motion.label>
                    </div>
                  </div>

                  {/* Modifications for Approve */}
                  {reviewForm.action === "approve" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-4 bg-green-50 p-6 rounded-xl border border-green-200"
                    >
                      <h4 className="text-sm font-semibold text-green-800 mb-4">
                        تعديلات اختيارية:
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الموزع
                        </label>
                        <select
                          value={reviewForm.modifications.distributor_id}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              modifications: {
                                ...reviewForm.modifications,
                                distributor_id: parseInt(e.target.value),
                              },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {distributors.map((distributor) => (
                            <option key={distributor.id} value={distributor.id}>
                              {distributor.full_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تاريخ التسليم
                        </label>
                        <input
                          type="date"
                          value={reviewForm.modifications.delivery_date}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              modifications: {
                                ...reviewForm.modifications,
                                delivery_date: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الأولوية
                        </label>
                        <select
                          value={reviewForm.modifications.priority}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              modifications: {
                                ...reviewForm.modifications,
                                priority: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {autoSchedulingService
                            .getPriorityOptions()
                            .map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <input
                          type="checkbox"
                          id="create_trip"
                          checked={reviewForm.create_distribution_trip}
                          onChange={(e) =>
                            setReviewForm({
                              ...reviewForm,
                              create_distribution_trip: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label
                          htmlFor="create_trip"
                          className="text-sm font-medium text-gray-700"
                        >
                          إنشاء رحلة توزيع تلقائياً
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ملاحظات الإدمن
                      {reviewForm.action === "reject" && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <textarea
                      value={reviewForm.admin_notes}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          admin_notes: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder={
                        reviewForm.action === "reject"
                          ? "اذكر سبب الرفض بالتفصيل..."
                          : "ملاحظات اختيارية حول القرار..."
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end space-x-4 rtl:space-x-reverse mt-8 pt-6 border-t border-gray-200">
            <EnhancedButton
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              إلغاء
            </EnhancedButton>
            <EnhancedButton
              onClick={onSubmit}
              variant={reviewForm.action === "approve" ? "success" : "danger"}
              disabled={loading || !reviewForm.action}
              loading={loading}
              icon={
                reviewForm.action === "approve" ? (
                  <CheckCircleIcon className="w-4 h-4" />
                ) : (
                  <XCircleIcon className="w-4 h-4" />
                )
              }
            >
              {reviewForm.action === "approve"
                ? "اعتماد الاقتراح"
                : "رفض الاقتراح"}
            </EnhancedButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AutoSchedulingReviewPage;
