import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ChartBarIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import StoresMap from "../../components/Stores/StoresMap";
import AddStoreModal from "../../components/Stores/AddStoreModal";
import PageHeader from "../../components/common/PageHeader";
import { Button } from "../../components/common";
import { getStoreStatistics } from "../../services/storesAPI";
import { formatCurrency, getLocalizedText } from "../../utils/formatters";
import toast from "react-hot-toast";
import { usePreferences } from "../../contexts/PreferencesContext";

const StoresDashboard = () => {
  const { preferences } = usePreferences();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const t = (key, ar, en) => getLocalizedText(key, ar, en);

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await getStoreStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  // Handle successful store addition
  const handleStoreAdded = () => {
    loadStatistics();
  };

  // Statistics card component
  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "blue",
    trend,
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span
            className={`text-sm font-medium ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
          <span className="text-sm text-gray-500 mr-2">من الشهر الماضي</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Unified Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PageHeader
          className="mb-6"
          icon={MapPinIcon}
          title={t("stores_map", "خريطة المحلات", "Stores Map")}
          subtitle={t(
            "stores_map_subtitle",
            "عرض المحلات على الخريطة مع الإحصائيات والمعلومات الجغرافية",
            "Display stores on the map with statistics and geo information"
          )}
        >
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="إجمالي المحلات"
              value={statistics.overview.total_stores}
              subtitle={`${statistics.overview.active_stores} نشط`}
              icon={BuildingStorefrontIcon}
              color="blue"
            />
            <StatCard
              title="المحلات النشطة"
              value={statistics.overview.active_stores}
              subtitle={`${statistics.overview.inactive_stores} غير نشط`}
              icon={CheckCircleIcon}
              color="green"
            />
            <StatCard
              title="التغطية الجغرافية"
              value={`${statistics.overview.location_coverage}%`}
              subtitle={`${statistics.overview.stores_with_location} محل بموقع`}
              icon={MapPinIcon}
              color="purple"
            />
            <StatCard
              title="أفضل محل"
              value={statistics.top_performing_stores[0]?.name || "-"}
              subtitle={formatCurrency(
                statistics.top_performing_stores[0]?.total_revenue || 0
              )}
              icon={ChartBarIcon}
              color="amber"
            />
          </div>
        )}

        {/* Map */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <StoresMap
              height="600px"
              showFilters={true}
              onStoreSelect={setSelectedStore}
              selectedStore={selectedStore}
            />
          </div>
        </div>
      </div>

      {/* Store Details Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  تفاصيل المحل
                </h2>
                <button
                  onClick={() => setSelectedStore(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      اسم المحل
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedStore.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      اسم المالك
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedStore.owner_name || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      الهاتف
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedStore.phone || "-"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      البريد الإلكتروني
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedStore.email || "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    العنوان
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedStore.address || "-"}
                  </p>
                </div>

                {selectedStore.latitude && selectedStore.longitude && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        خط العرض
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedStore.latitude}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        خط الطول
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedStore.longitude}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      طريقة الدفع
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedStore.payment_method === "cash"
                        ? "نقدي"
                        : selectedStore.payment_method === "bank"
                        ? "بنكي"
                        : "مختلط"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      حد الائتمان
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatCurrency(selectedStore.credit_limit)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      الرصيد الحالي
                    </label>
                    <p
                      className={`mt-1 text-sm font-medium ${
                        selectedStore.current_balance > 0
                          ? "text-red-600"
                          : selectedStore.current_balance < 0
                          ? "text-green-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(selectedStore.current_balance)}
                    </p>
                  </div>
                </div>

                {selectedStore.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ملاحظات
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedStore.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedStore(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleStoreAdded}
      />
    </div>
  );
};

export default StoresDashboard;
