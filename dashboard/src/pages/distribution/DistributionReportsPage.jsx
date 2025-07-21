/**
 * Distribution Reports Page
 * Comprehensive Distribution Analytics and Reporting
 * Phase 6 - Complete Order Management
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  FilterIcon,
} from "@heroicons/react/24/outline";

// Services
import distributorService from "../../services/distributorService";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const DistributionReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({
    date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    date_to: new Date().toISOString().split("T")[0],
    distributor_id: "",
    report_type: "all",
  });
  const [reportType, setReportType] = useState("daily");
  const [showFilters, setShowFilters] = useState(false);

  // Load initial data
  useEffect(() => {
    loadReports();
    loadAnalytics();
  }, [filters, reportType]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await distributorService.getDistributorAnalytics(null, {
        date_from: filters.date_from,
        date_to: filters.date_to,
        distributor_id: filters.distributor_id || null,
        report_type: reportType,
      });

      if (response.success) {
        setReports(response.data.reports || []);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("خطأ في تحميل التقارير");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await distributorService.getDistributorAnalytics(null, {
        date_from: filters.date_from,
        date_to: filters.date_to,
        include_summary: true,
      });

      if (response.success) {
        setAnalytics(response.data.summary || {});
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReportTypeChange = (type) => {
    setReportType(type);
  };

  const handleExportReport = async (reportId) => {
    try {
      const response = await distributorService.exportReport(reportId);
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `distribution-report-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("تم تصدير التقرير بنجاح");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("خطأ في تصدير التقرير");
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await distributorService.generateReport({
        report_type: reportType,
        date_from: filters.date_from,
        date_to: filters.date_to,
        distributor_id: filters.distributor_id || null,
      });

      if (response.success) {
        toast.success("تم إنشاء التقرير بنجاح");
        loadReports();
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("خطأ في إنشاء التقرير");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      date_to: new Date().toISOString().split("T")[0],
      distributor_id: "",
      report_type: "all",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تقارير التوزيع</h1>
          <p className="text-gray-600 mt-1">تحليلات شاملة وإحصائيات التوزيع</p>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-sm"
          >
            <FilterIcon className="w-4 h-4 mr-2 rtl:ml-2" />
            الفلاتر
          </button>
          <button
            onClick={generateReport}
            disabled={loading}
            className="btn btn-primary btn-sm"
          >
            <DocumentTextIcon className="w-4 h-4 mr-2 rtl:ml-2" />
            إنشاء تقرير جديد
          </button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي التسليمات"
          value={analytics.total_deliveries || 0}
          icon={TruckIcon}
          color="blue"
          change={analytics.delivery_growth || 0}
        />
        <StatsCard
          title="معدل الإنجاز"
          value={`${analytics.completion_rate || 0}%`}
          icon={CheckCircleIcon}
          color="green"
          change={analytics.completion_growth || 0}
        />
        <StatsCard
          title="متوسط وقت التسليم"
          value={`${analytics.avg_delivery_time || 0} دقيقة`}
          icon={ClockIcon}
          color="orange"
          change={analytics.time_growth || 0}
        />
        <StatsCard
          title="الموزعون النشطون"
          value={analytics.active_distributors || 0}
          icon={UserGroupIcon}
          color="purple"
          change={analytics.distributor_growth || 0}
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">الفلاتر</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              مسح الفلاتر
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  handleFilterChange("date_from", e.target.value)
                }
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
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
                {/* Add distributor options here */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع التقرير
              </label>
              <select
                value={filters.report_type}
                onChange={(e) =>
                  handleFilterChange("report_type", e.target.value)
                }
                className="select select-bordered w-full"
              >
                <option value="all">جميع الأنواع</option>
                <option value="daily">يومي</option>
                <option value="weekly">أسبوعي</option>
                <option value="monthly">شهري</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Report Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
          {[
            { id: "daily", label: "التقارير اليومية", icon: CalendarIcon },
            { id: "weekly", label: "التقارير الأسبوعية", icon: ChartBarIcon },
            {
              id: "monthly",
              label: "التقارير الشهرية",
              icon: DocumentTextIcon,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleReportTypeChange(tab.id)}
              className={`flex items-center space-x-2 rtl:space-x-reverse py-2 px-1 border-b-2 font-medium text-sm ${
                reportType === tab.id
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

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد تقارير متاحة
              </h3>
              <p className="text-gray-600">
                قم بإنشاء تقرير جديد لعرض البيانات والإحصائيات
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onSelect={() => setSelectedReport(report)}
                  onExport={() => handleExportReport(report.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onExport={() => handleExportReport(selectedReport.id)}
        />
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, change }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    green: "text-green-600 bg-green-100",
    orange: "text-orange-600 bg-orange-100",
    purple: "text-purple-600 bg-purple-100",
  };

  const changeColor = change >= 0 ? "text-green-600" : "text-red-600";
  const changeIcon = change >= 0 ? "↗" : "↘";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="mr-4 rtl:ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change !== undefined && (
          <div className={`text-sm font-medium ${changeColor}`}>
            {changeIcon} {Math.abs(change)}%
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Report Card Component
const ReportCard = ({ report, onSelect, onExport }) => {
  const getReportTypeInfo = (type) => {
    switch (type) {
      case "daily":
        return { label: "يومي", color: "blue" };
      case "weekly":
        return { label: "أسبوعي", color: "green" };
      case "monthly":
        return { label: "شهري", color: "purple" };
      default:
        return { label: "غير محدد", color: "gray" };
    }
  };

  const typeInfo = getReportTypeInfo(report.report_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 border-l-4"
      style={{
        borderLeftColor:
          typeInfo.color === "blue"
            ? "#3B82F6"
            : typeInfo.color === "green"
            ? "#10B981"
            : typeInfo.color === "purple"
            ? "#8B5CF6"
            : "#6B7280",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            تقرير {typeInfo.label}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(report.created_at).toLocaleDateString("ar-SA")}
          </p>
        </div>
        <span
          className="px-2 py-1 text-xs font-medium rounded-full"
          style={{
            backgroundColor:
              typeInfo.color === "blue"
                ? "#DBEAFE"
                : typeInfo.color === "green"
                ? "#D1FAE5"
                : typeInfo.color === "purple"
                ? "#EDE9FE"
                : "#F3F4F6",
            color:
              typeInfo.color === "blue"
                ? "#1D4ED8"
                : typeInfo.color === "green"
                ? "#065F46"
                : typeInfo.color === "purple"
                ? "#5B21B6"
                : "#374151",
          }}
        >
          {typeInfo.label}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <TruckIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>التسليمات: {report.total_deliveries || 0}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <CheckCircleIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>معدل الإنجاز: {report.completion_rate || 0}%</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <ClockIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          <span>متوسط الوقت: {report.avg_delivery_time || 0} دقيقة</span>
        </div>

        {report.notes && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            {report.notes}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onSelect} className="btn btn-sm btn-outline">
          <EyeIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          عرض التفاصيل
        </button>
        <button onClick={onExport} className="btn btn-sm btn-outline">
          <ArrowDownTrayIcon className="w-4 h-4 mr-2 rtl:ml-2" />
          تصدير
        </button>
      </div>
    </motion.div>
  );
};

// Report Details Modal Component
const ReportDetailsModal = ({ report, onClose, onExport }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              تفاصيل التقرير
            </h2>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button onClick={onExport} className="btn btn-sm btn-outline">
                <ArrowDownTrayIcon className="w-4 h-4 mr-2 rtl:ml-2" />
                تصدير
              </button>
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
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                ملخص التقرير
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">
                        إجمالي التسليمات
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {report.total_deliveries || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">معدل الإنجاز</div>
                      <div className="text-2xl font-bold text-green-600">
                        {report.completion_rate || 0}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        متوسط وقت التسليم
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {report.avg_delivery_time || 0} دقيقة
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">
                        الموزعون النشطون
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {report.active_distributors || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                مقاييس الأداء
              </h3>
              <div className="space-y-4">
                {report.performance_metrics &&
                  Object.entries(report.performance_metrics).map(
                    ([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{key}</span>
                          <span className="font-medium">{value}</span>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>

          {/* Detailed Data */}
          {report.detailed_data && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                البيانات التفصيلية
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(report.detailed_data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Notes */}
          {report.notes && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                الملاحظات
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{report.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistributionReportsPage;
