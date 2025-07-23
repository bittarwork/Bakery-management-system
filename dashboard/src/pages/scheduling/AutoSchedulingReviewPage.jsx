import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  BrainIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  EyeIcon,
  ClockIcon,
  TruckIcon,
  UserGroupIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";

// Services
import autoSchedulingService from "../../services/autoSchedulingService";
import userService from "../../services/userService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";

const AutoSchedulingReviewPage = () => {
  const [loading, setLoading] = useState(false);
  const [pendingDrafts, setPendingDrafts] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: "pending_review",
    min_confidence: "",
    max_confidence: "",
    date_from: "",
    date_to: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Review form states
  const [reviewForm, setReviewForm] = useState({
    action: "", // approve, reject, modify
    modifications: {
      distributor_id: "",
      delivery_date: "",
      priority: "",
    },
    admin_notes: "",
    create_distribution_trip: true,
  });

  // Load initial data
  useEffect(() => {
    loadPendingDrafts();
    loadStatistics();
    loadDistributors();
  }, [filters, pagination.currentPage]);

  const loadPendingDrafts = async () => {
    setLoading(true);
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
          setPagination(response.data.pagination);
        }
      } else {
        toast.error(response.message || "خطأ في تحميل المسودات");
      }
    } catch (error) {
      console.error("Error loading pending drafts:", error);
      toast.error("خطأ في الاتصال بالخادم");
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
        setDistributors(response.data || []);
      }
    } catch (error) {
      console.error("Error loading distributors:", error);
    }
  };

  const handleDraftSelect = async (draft) => {
    try {
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
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedDraft || !reviewForm.action) {
      toast.error("يرجى اختيار إجراء");
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
        if (!reviewForm.admin_notes.trim()) {
          toast.error("سبب الرفض مطلوب");
          return;
        }

        response = await autoSchedulingService.rejectSchedulingDraft(
          selectedDraft.id,
          reviewForm.admin_notes,
          false // Don't reassign to manual for now
        );
      }

      if (response.success) {
        toast.success(response.message || "تم تحديث المسودة بنجاح");
        setShowReviewModal(false);
        setSelectedDraft(null);
        loadPendingDrafts();
        loadStatistics();
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

  // Get confidence badge
  const getConfidenceBadge = (score, level) => {
    const colorClasses = {
      green: "bg-green-100 text-green-800",
      blue: "bg-blue-100 text-blue-800",
      yellow: "bg-yellow-100 text-yellow-800",
      orange: "bg-orange-100 text-orange-800",
      red: "bg-red-100 text-red-800",
    };

    const color = autoSchedulingService.getConfidenceColor(score);

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colorClasses[color] || colorClasses.gray
        }`}
      >
        <SparklesIcon className="w-3 h-3 ml-1" />
        {score}% - {level}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BrainIcon className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              مراجعة الجدولة التلقائية
            </h1>
            <p className="text-gray-600 mt-1">
              مراجعة واعتماد اقتراحات النظام الذكي
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => setShowStatsModal(true)}
            className="btn btn-outline flex items-center space-x-2 rtl:space-x-reverse"
          >
            <ChartBarIcon className="w-5 h-5" />
            <span>الإحصائيات</span>
          </button>
          <button
            onClick={loadPendingDrafts}
            className="btn btn-primary flex items-center space-x-2 rtl:space-x-reverse"
          >
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              ></circle>
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
              ></path>
            </svg>
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">في الانتظار</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    pendingDrafts.filter((d) => d.status === "pending_review")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">معتمد اليوم</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.accuracy_metrics?.approved_without_changes || 0}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SparklesIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">متوسط الثقة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.accuracy_metrics?.average_confidence || 0}%
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TruckIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-500">معدل الدقة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.accuracy_metrics?.approval_rate || 0}%
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">الفلاتر</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="input input-bordered w-full"
              >
                {autoSchedulingService.getStatusOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="input input-bordered w-full"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="input input-bordered w-full"
                placeholder="100"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilters({
                    status: "pending_review",
                    min_confidence: "",
                    max_confidence: "",
                    date_from: "",
                    date_to: "",
                  })
                }
                className="btn btn-outline w-full"
              >
                مسح الفلاتر
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Pending Drafts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              المسودات المعلقة
            </h3>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <BellAlertIcon className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-500">
                {pendingDrafts.length} مسودة تحتاج مراجعة
              </span>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-8">
              <LoadingSpinner text="جاري تحميل المسودات..." />
            </div>
          ) : pendingDrafts.length === 0 ? (
            <div className="text-center py-12">
              <BrainIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                لا توجد مسودات معلقة
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                جميع الاقتراحات تمت مراجعتها
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      رقم الطلب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المحل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الموزع المقترح
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      درجة الثقة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ التسليم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      القيمة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {pendingDrafts.map((draft) => (
                      <motion.tr
                        key={draft.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {draft.order_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {draft.store_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {draft.store_address}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 text-gray-400 ml-2" />
                            <span className="text-sm text-gray-900">
                              {draft.suggested_distributor_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getConfidenceBadge(
                            draft.confidence_score,
                            draft.confidence_level
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400 ml-2" />
                            <span className="text-sm text-gray-900">
                              {draft.formatted_date}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {draft.formatted_amount_eur}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDraftSelect(draft)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <EyeIcon className="h-4 w-4 ml-1" />
                            مراجعة
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

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
  );
};

// Review Modal Component
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              مراجعة اقتراح الجدولة - {draft.order_number}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Draft Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                تفاصيل الاقتراح
              </h3>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    درجة الثقة:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {draft.confidence_score_display} - {draft.confidence_level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    الموزع المقترح:
                  </span>
                  <span className="text-sm text-gray-900">
                    {draft.suggested_distributor_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    تاريخ التسليم:
                  </span>
                  <span className="text-sm text-gray-900">
                    {draft.formatted_date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    الأولوية:
                  </span>
                  <span className="text-sm text-gray-900">
                    {autoSchedulingService.getPriorityDisplayName(
                      draft.suggested_priority
                    )}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  أسباب الاختيار:
                </h4>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                  {draft.reasoning_text}
                </p>
              </div>
            </div>

            {/* Review Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                إجراء المراجعة
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر الإجراء
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
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
                      className="ml-2"
                    />
                    <CheckCircleIcon className="w-5 h-5 text-green-500 ml-2" />
                    اعتماد الاقتراح
                  </label>
                  <label className="flex items-center">
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
                      className="ml-2"
                    />
                    <XCircleIcon className="w-5 h-5 text-red-500 ml-2" />
                    رفض الاقتراح
                  </label>
                </div>
              </div>

              {reviewForm.action === "approve" && (
                <div className="space-y-4 bg-green-50 p-4 rounded">
                  <h4 className="text-sm font-medium text-gray-700">
                    تعديلات اختيارية:
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="input input-bordered w-full"
                    >
                      {distributors.map((distributor) => (
                        <option key={distributor.id} value={distributor.id}>
                          {distributor.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="input input-bordered w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="input input-bordered w-full"
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
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ملاحظات الإدمن{" "}
                  {reviewForm.action === "reject" && (
                    <span className="text-red-500">*</span>
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
                  className="input input-bordered w-full h-24"
                  placeholder={
                    reviewForm.action === "reject"
                      ? "اذكر سبب الرفض..."
                      : "ملاحظات اختيارية..."
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              onClick={onSubmit}
              className={`btn ${
                reviewForm.action === "approve" ? "btn-success" : "btn-error"
              }`}
              disabled={loading || !reviewForm.action}
            >
              {loading ? (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري المعالجة...</span>
                </div>
              ) : reviewForm.action === "approve" ? (
                "اعتماد"
              ) : (
                "رفض"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AutoSchedulingReviewPage;
