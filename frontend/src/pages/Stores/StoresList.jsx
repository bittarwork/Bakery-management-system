import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  CreditCardIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
} from "@heroicons/react/24/solid";
import AddStoreModal from "../../components/Stores/AddStoreModal";
import StoreDetailsModal from "../../components/Stores/StoreDetailsModal";
import EditStoreModal from "../../components/Stores/EditStoreModal";
import ExportModal from "../../components/Stores/ExportModal";
import DeleteConfirmModal from "../../components/Stores/DeleteConfirmModal";
import PageHeader from "../../components/common/PageHeader";
import { Button } from "../../components/common";
import { getStores, deleteStore } from "../../services/storesAPI";
import { formatCurrency, getLocalizedText } from "../../utils/formatters";
import toast from "react-hot-toast";

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    is_active: "true", // عرض المحلات النشطة فقط افتراضياً
    payment_method: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12, // Default items per page
    total: 0,
    totalPages: 0,
  });

  // after state declarations, define localization helper
  const t = (key, ar, en) => getLocalizedText(key, ar, en);

  // Load stores
  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await getStores({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setStores(response.data.stores);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error loading stores:", error);
      toast.error("فشل في تحميل المحلات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, [filters, pagination.page]);

  // Update pagination when needed
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      limit: 20, // Default items per page
      page: 1,
    }));
  }, []);

  // Handle store deletion
  const handleDeleteStore = (store) => {
    setSelectedStore(store);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    loadStores();
    setShowDeleteModal(false);
    setSelectedStore(null);
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      is_active: "true", // عرض المحلات النشطة عند مسح الفلاتر
      payment_method: "",
    });
  };

  // Handle view store details
  const handleViewStore = (store) => {
    setSelectedStore(store);
    setShowDetailsModal(true);
  };

  // Handle edit store
  const handleEditStore = (store) => {
    setSelectedStore(store);
    setShowEditModal(true);
  };

  // Handle modal close
  const handleCloseModals = () => {
    setSelectedStore(null);
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowExportModal(false);
    setShowDeleteModal(false);
  };

  // Handle successful operations
  const handleSuccess = () => {
    loadStores();
    handleCloseModals();
  };

  // Handle export
  const handleExport = () => {
    setShowExportModal(true);
  };

  // Get store status info
  const getStoreStatus = (store) => {
    if (!store.is_active) {
      return {
        label: "غير نشط",
        color: "red",
        icon: XCircleIconSolid,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        iconColor: "text-red-500",
      };
    }

    if (store.current_balance > store.credit_limit) {
      return {
        label: "تجاوز الحد الائتماني",
        color: "amber",
        icon: ExclamationTriangleIconSolid,
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        iconColor: "text-amber-500",
      };
    }

    return {
      label: "نشط",
      color: "green",
      icon: CheckCircleIconSolid,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      iconColor: "text-green-500",
    };
  };

  // Get payment method info
  const getPaymentMethodInfo = (method) => {
    const methods = {
      cash: { label: "نقدي", color: "green", icon: BanknotesIcon },
      bank: { label: "بنكي", color: "blue", icon: CreditCardIcon },
      mixed: { label: "مختلط", color: "purple", icon: CreditCardIcon },
    };
    return methods[method] || methods.cash;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          className="mb-6"
          icon={MapPinIcon}
          title={t("stores_list", "قائمة المحلات", "Stores List")}
          subtitle={t(
            "stores_list_subtitle",
            "إدارة وعرض جميع المحلات المسجلة في النظام",
            "Manage and view all stores registered in the system"
          )}
        >
          <Button
            variant="outline"
            size="md"
            icon={FunnelIcon}
            onClick={() => setShowFilters(!showFilters)}
          >
            {t("filter", "المرشحات", "Filters")}
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={ArrowPathIcon}
            onClick={loadStores}
          >
            {t("refresh", "تحديث", "Refresh")}
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={ArrowDownTrayIcon}
            onClick={handleExport}
            disabled={stores.length === 0}
          >
            {t("export", "تصدير", "Export")}
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={PlusIcon}
            onClick={() => setShowAddModal(true)}
          >
            {t("add", "إضافة", "Add")}
          </Button>
        </PageHeader>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">المرشحات</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البحث
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder="اسم المحل، المالك، العنوان..."
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  value={filters.is_active}
                  onChange={(e) =>
                    handleFilterChange("is_active", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">جميع المحلات</option>
                  <option value="true">نشط</option>
                  <option value="false">غير نشط</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">جميع الطرق</option>
                  <option value="cash">نقدي</option>
                  <option value="bank">بنكي</option>
                  <option value="mixed">مختلط</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  {t("reset", "مسح المرشحات", "Reset")}
                </Button>
                <Button variant="primary" size="sm" onClick={loadStores}>
                  {t("apply", "تطبيق", "Apply")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">
                  إجمالي المحلات
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {pagination.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">
                  المحلات النشطة
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stores.filter((s) => s.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">
                  المحلات غير النشطة
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stores.filter((s) => !s.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">
                  تجاوز الحد الائتماني
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {
                    stores.filter((s) => s.current_balance > s.credit_limit)
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stores Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPinIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد محلات
            </h3>
            <p className="text-gray-500 mb-6">
              لم يتم العثور على محلات تطابق المرشحات المحددة
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 ml-2" />
              إضافة محل جديد
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => {
                const status = getStoreStatus(store);
                const paymentMethod = getPaymentMethodInfo(
                  store.payment_method
                );

                return (
                  <div
                    key={store.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {store.name}
                          </h3>
                          {store.owner_name && (
                            <p className="text-sm text-gray-600">
                              المالك: {store.owner_name}
                            </p>
                          )}
                        </div>
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}`}
                        >
                          <status.icon
                            className={`w-3 h-3 ml-1 ${status.iconColor}`}
                          />
                          {status.label}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4">
                        {store.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="w-4 h-4 ml-2 text-gray-400" />
                            {store.phone}
                          </div>
                        )}
                        {store.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <EnvelopeIcon className="w-4 h-4 ml-2 text-gray-400" />
                            {store.email}
                          </div>
                        )}
                        {store.address && (
                          <div className="flex items-start text-sm text-gray-600">
                            <MapPinIcon className="w-4 h-4 ml-2 mt-0.5 text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-2">
                              {store.address}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Financial Info */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            الرصيد الحالي
                          </p>
                          <p
                            className={`text-sm font-semibold ${
                              store.current_balance > 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {formatCurrency(store.current_balance)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            الحد الائتماني
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(store.credit_limit)}
                          </p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="mb-4">
                        <div
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            paymentMethod.color === "green"
                              ? "bg-green-100 text-green-700"
                              : paymentMethod.color === "blue"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          <paymentMethod.icon
                            className={`w-3 h-3 ml-1 ${
                              paymentMethod.color === "green"
                                ? "text-green-600"
                                : paymentMethod.color === "blue"
                                ? "text-blue-600"
                                : "text-purple-600"
                            }`}
                          />
                          {paymentMethod.label}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleViewStore(store)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <EyeIcon className="w-3 h-3 ml-1" />
                          عرض
                        </button>
                        <button
                          onClick={() => handleEditStore(store)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <PencilIcon className="w-3 h-3 ml-1" />
                          تعديل
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteStore(store)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="w-3 h-3 ml-1" />
                        حذف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      عرض{" "}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{" "}
                      إلى{" "}
                      <span className="font-medium">
                        {Math.min(
                          pagination.page * pagination.limit,
                          pagination.total
                        )}
                      </span>{" "}
                      من <span className="font-medium">{pagination.total}</span>{" "}
                      نتيجة
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: prev.page - 1,
                          }))
                        }
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        السابق
                      </button>
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() =>
                            setPagination((prev) => ({ ...prev, page: i + 1 }))
                          }
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === i + 1
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            page: prev.page + 1,
                          }))
                        }
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        التالي
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadStores}
      />

      {/* Store Details Modal */}
      <StoreDetailsModal
        store={selectedStore}
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
      />

      {/* Edit Store Modal */}
      <EditStoreModal
        store={selectedStore}
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onSuccess={handleSuccess}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        store={selectedStore}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default StoresList;
