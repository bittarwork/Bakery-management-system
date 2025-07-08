import React, { useState } from "react";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { getStores } from "../../services/storesAPI";
import toast from "react-hot-toast";

const ExportModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    is_active: "all",
    payment_method: "",
    region_id: "",
  });
  const [exportOptions, setExportOptions] = useState({
    includeInactive: true,
    includeFinancial: true,
    includeLocation: true,
    includeContact: true,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOptionChange = (key, value) => {
    setExportOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const exportToCSV = async () => {
    try {
      setLoading(true);

      // Get all stores with current filters (no pagination)
      const response = await getStores({
        ...filters,
        limit: 1000, // Get all stores
        page: 1,
      });

      const stores = response.data.stores;

      if (stores.length === 0) {
        toast.error("لا توجد محلات للتصدير");
        return;
      }

      // Build headers based on selected options
      const headers = ["اسم المحل"];

      if (exportOptions.includeContact) {
        headers.push("اسم المالك", "الهاتف", "البريد الإلكتروني");
      }

      if (exportOptions.includeLocation) {
        headers.push("العنوان", "خط العرض", "خط الطول");
      }

      if (exportOptions.includeFinancial) {
        headers.push(
          "طريقة الدفع",
          "الحد الائتماني",
          "الرصيد الحالي",
          "الرصيد المتاح"
        );
      }

      headers.push("الحالة", "تاريخ الإنشاء");

      // Build CSV data
      const csvData = stores.map((store) => {
        const row = [store.name || ""];

        if (exportOptions.includeContact) {
          row.push(
            store.owner_name || "",
            store.phone || "",
            store.email || ""
          );
        }

        if (exportOptions.includeLocation) {
          row.push(
            store.address || "",
            store.latitude || "",
            store.longitude || ""
          );
        }

        if (exportOptions.includeFinancial) {
          const paymentMethodText =
            store.payment_method === "cash"
              ? "نقدي"
              : store.payment_method === "bank"
              ? "بنكي"
              : "مختلط";

          row.push(
            paymentMethodText,
            store.credit_limit || 0,
            store.current_balance || 0,
            (store.credit_limit || 0) - (store.current_balance || 0)
          );
        }

        row.push(
          store.is_active ? "نشط" : "غير نشط",
          new Date(store.created_at).toLocaleDateString("en-GB")
        );

        return row;
      });

      // Create CSV content
      const csvContent = [headers, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      // Download CSV
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `stores_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`تم تصدير ${stores.length} محل بنجاح`);
      onClose();
    } catch (error) {
      console.error("Error exporting stores:", error);
      toast.error("فشل في تصدير البيانات");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3 space-x-reverse">
            <ArrowDownTrayIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">تصدير المحلات</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Filters Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FunnelIcon className="h-5 w-5 ml-2 text-gray-500" />
              فلاتر التصدير
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البحث
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ابحث في اسم المحل أو المالك..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حالة المحل
                </label>
                <select
                  value={filters.is_active}
                  onChange={(e) =>
                    handleFilterChange("is_active", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع المحلات</option>
                  <option value="true">المحلات النشطة</option>
                  <option value="false">المحلات غير النشطة</option>
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  طريقة الدفع
                </label>
                <select
                  value={filters.payment_method}
                  onChange={(e) =>
                    handleFilterChange("payment_method", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">جميع طرق الدفع</option>
                  <option value="cash">نقدي</option>
                  <option value="bank">بنكي</option>
                  <option value="mixed">مختلط</option>
                </select>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              خيارات التصدير
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeContact}
                  onChange={(e) =>
                    handleOptionChange("includeContact", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                />
                <span className="text-sm text-gray-700">
                  تضمين معلومات الاتصال (المالك، الهاتف، البريد الإلكتروني)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeLocation}
                  onChange={(e) =>
                    handleOptionChange("includeLocation", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                />
                <span className="text-sm text-gray-700">
                  تضمين معلومات الموقع (العنوان، الإحداثيات)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportOptions.includeFinancial}
                  onChange={(e) =>
                    handleOptionChange("includeFinancial", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                />
                <span className="text-sm text-gray-700">
                  تضمين المعلومات المالية (الحد الائتماني، الرصيد)
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              معاينة الأعمدة المُصدرة:
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                اسم المحل
              </span>
              {exportOptions.includeContact && (
                <>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    اسم المالك
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    الهاتف
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    البريد الإلكتروني
                  </span>
                </>
              )}
              {exportOptions.includeLocation && (
                <>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    العنوان
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    خط العرض
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    خط الطول
                  </span>
                </>
              )}
              {exportOptions.includeFinancial && (
                <>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    طريقة الدفع
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    الحد الائتماني
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    الرصيد الحالي
                  </span>
                </>
              )}
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                الحالة
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                تاريخ الإنشاء
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 space-x-reverse p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            onClick={exportToCSV}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
            )}
            <ArrowDownTrayIcon className="h-4 w-4 ml-2" />
            تصدير CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
