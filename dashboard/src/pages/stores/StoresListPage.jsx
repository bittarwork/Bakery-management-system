import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Store,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  BarChart3,
  Map,
  List,
  TrendingUp,
  Users,
  Euro,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { DeleteConfirmationModal } from "../../components/ui/Modal";
import StoreMap from "../../components/ui/StoreMap";
import storeService from "../../services/storeService";

const StoresListPage = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // View mode (list/map)
  const [viewMode, setViewMode] = useState("list");

  // فلاتر البحث
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    store_type: "",
  });

  // التصفح
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // الإحصائيات
  const [statistics, setStatistics] = useState({
    totalStores: 0,
    activeStores: 0,
    inactiveStores: 0,
    totalRevenue: 0,
  });

  // Modal الحذف
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    storeId: null,
    storeName: "",
    isLoading: false,
  });

  // تحميل البيانات
  useEffect(() => {
    loadStores();
    loadStatistics();
  }, [pagination.currentPage, filters]);

  const loadStores = async () => {
    try {
      setIsLoading(true);
      setError("");

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters,
      };

      const response = await storeService.getStores(params);

      if (response.success) {
        const storesData = response.data?.stores || response.data || [];
        setStores(storesData);

        if (response.data?.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalPages: response.data.pagination.totalPages || 1,
            totalItems: response.data.pagination.total || storesData.length,
          }));
        }
      } else {
        setError(response.message || "خطأ في تحميل البيانات");
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      setError("خطأ في تحميل بيانات المتاجر");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // Get general store statistics (not specific store)
      const response = await storeService.getStoreStatistics();
      if (response.success) {
        setStatistics({
          totalStores: response.data?.total || 0,
          activeStores: response.data?.active || 0,
          inactiveStores: response.data?.inactive || 0,
          totalRevenue: response.data?.total_revenue || 0,
        });
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
      // Set default values if statistics fail to load
      setStatistics({
        totalStores: stores.length,
        activeStores: stores.filter((s) => s.status === "active").length,
        inactiveStores: stores.filter((s) => s.status === "inactive").length,
        totalRevenue: 0,
      });
    }
  };

  // معالجة تغيير الفلاتر
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // معالجة البحث
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // تصدير البيانات
  const handleExport = async (format = "json") => {
    try {
      setIsExporting(true);
      setError("");

      // Simulate export functionality
      const data = stores.map((store) => ({
        id: store.id,
        name: store.name,
        address: store.address,
        phone: store.phone,
        email: store.email,
        status: store.status,
        total_orders: store.total_orders,
        total_revenue: store.total_purchases_eur,
      }));

      if (format === "csv") {
        // Convert to CSV
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map((row) => Object.values(row).join(","));
        const csv = [headers, ...rows].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `stores_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Download JSON
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `stores_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      setSuccess(`تم تصدير البيانات بنجاح بصيغة ${format.toUpperCase()}`);
    } catch (error) {
      setError("خطأ في تصدير البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  // فتح modal الحذف
  const openDeleteModal = (storeId, storeName) => {
    setDeleteModal({
      isOpen: true,
      storeId,
      storeName,
      isLoading: false,
    });
  };

  // إغلاق modal الحذف
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      storeId: null,
      storeName: "",
      isLoading: false,
    });
  };

  // تأكيد الحذف
  const confirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));
      setError("");

      const response = await storeService.deleteStore(deleteModal.storeId);

      if (response.success) {
        setSuccess("تم حذف المتجر بنجاح");
        closeDeleteModal();
        loadStores();
        loadStatistics();
      } else {
        setError(response.message || "خطأ في حذف المتجر");
      }
    } catch (error) {
      setError("خطأ في حذف المتجر");
    } finally {
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // تغيير حالة متجر
  const handleToggleStatus = async (storeId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      setError("");
      const response = await storeService.updateStoreStatus(storeId, newStatus);

      if (response.success) {
        setSuccess(
          `تم ${newStatus === "active" ? "تفعيل" : "إلغاء تفعيل"} المتجر بنجاح`
        );
        loadStores();
        loadStatistics();
      } else {
        setError(response.message || "خطأ في تغيير حالة المتجر");
      }
    } catch (error) {
      setError("خطأ في تغيير حالة المتجر");
    }
  };

  // إزالة الرسائل
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (isLoading && stores.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="xl" text="جاري تحميل بيانات المتاجر..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                إدارة المتاجر
              </h1>
              <p className="text-gray-600 text-lg">
                إدارة متاجر المخبز في بلجيكا
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                <EnhancedButton
                  onClick={() => setViewMode("list")}
                  variant={viewMode === "list" ? "primary" : "ghost"}
                  size="sm"
                  icon={<List className="w-4 h-4" />}
                >
                  قائمة
                </EnhancedButton>
                <EnhancedButton
                  onClick={() => setViewMode("map")}
                  variant={viewMode === "map" ? "primary" : "ghost"}
                  size="sm"
                  icon={<Map className="w-4 h-4" />}
                >
                  خريطة
                </EnhancedButton>
              </div>

              <EnhancedButton
                onClick={() => navigate("/stores/create")}
                variant="primary"
                size="lg"
                icon={<Plus className="w-5 h-5" />}
              >
                إضافة متجر جديد
              </EnhancedButton>
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        إجمالي المتاجر
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.totalStores}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Store className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        المتاجر النشطة
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.activeStores}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">
                        المتاجر غير النشطة
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {statistics.inactiveStores}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <XCircle className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        إجمالي الإيرادات
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        €{(statistics.totalRevenue || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Euro className="w-8 h-8" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* رسائل النجاح والخطأ */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                <span className="text-green-800 font-medium">{success}</span>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* أدوات البحث والفلترة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6 border-0 shadow-lg">
            <CardBody className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* البحث */}
                  <EnhancedInput
                    type="text"
                    placeholder="البحث في المتاجر..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    icon={<Search className="w-4 h-4" />}
                    size="md"
                  />

                  {/* فلتر الحالة */}
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="suspended">معلق</option>
                  </select>

                  {/* فلتر الفئة */}
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع الفئات</option>
                    <option value="supermarket">سوبر ماركت</option>
                    <option value="grocery">بقالة</option>
                    <option value="cafe">مقهى</option>
                    <option value="restaurant">مطعم</option>
                    <option value="bakery">مخبز</option>
                    <option value="hotel">فندق</option>
                    <option value="other">أخرى</option>
                  </select>

                  {/* فلتر النوع */}
                  <select
                    value={filters.store_type}
                    onChange={(e) =>
                      handleFilterChange("store_type", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع الأنواع</option>
                    <option value="retail">بيع بالتجزئة</option>
                    <option value="wholesale">بيع بالجملة</option>
                    <option value="restaurant">مطعم</option>
                  </select>

                  {/* أزرار الإجراءات */}
                  <div className="flex gap-2">
                    <EnhancedButton
                      type="submit"
                      variant="primary"
                      icon={<Search className="w-4 h-4" />}
                    >
                      بحث
                    </EnhancedButton>
                    <EnhancedButton
                      type="button"
                      variant="secondary"
                      icon={<RefreshCw className="w-4 h-4" />}
                      onClick={() => {
                        setFilters({
                          search: "",
                          status: "",
                          category: "",
                          store_type: "",
                        });
                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                      }}
                    >
                      إعادة تعيين
                    </EnhancedButton>
                  </div>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>

        {/* المحتوى */}
        {viewMode === "list" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    قائمة المتاجر
                  </h2>
                  <div className="flex gap-2">
                    <EnhancedButton
                      onClick={() => handleExport("json")}
                      disabled={isExporting}
                      variant="success"
                      size="sm"
                      icon={
                        isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )
                      }
                    >
                      تصدير JSON
                    </EnhancedButton>
                    <EnhancedButton
                      onClick={() => handleExport("csv")}
                      disabled={isExporting}
                      variant="warning"
                      size="sm"
                      icon={
                        isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )
                      }
                    >
                      تصدير CSV
                    </EnhancedButton>
                  </div>
                </div>
              </CardHeader>

              <CardBody className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <LoadingSpinner size="lg" text="جاري تحميل البيانات..." />
                  </div>
                ) : stores.length === 0 ? (
                  <div className="p-8 text-center">
                    <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      لا توجد متاجر
                    </h3>
                    <p className="text-gray-600">
                      لم يتم العثور على متاجر تطابق معايير البحث
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المتجر
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الفئة
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإيرادات
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الطلبات
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stores.map((store, index) => (
                          <motion.tr
                            key={store.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                                    <Store className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                                <div className="mr-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {store.name}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {store.address || "لا يوجد عنوان"}
                                  </div>
                                  {store.phone && (
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {store.phone}
                                    </div>
                                  )}
                                  {store.email && (
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {store.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                  store.category === "supermarket"
                                    ? "bg-purple-100 text-purple-800"
                                    : store.category === "grocery"
                                    ? "bg-blue-100 text-blue-800"
                                    : store.category === "cafe"
                                    ? "bg-green-100 text-green-800"
                                    : store.category === "restaurant"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : store.category === "bakery"
                                    ? "bg-orange-100 text-orange-800"
                                    : store.category === "hotel"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {store.category || "غير محدد"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                  store.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : store.status === "inactive"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {store.status === "active"
                                  ? "نشط"
                                  : store.status === "inactive"
                                  ? "غير نشط"
                                  : "معلق"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-1">
                                <Euro className="w-3 h-3 text-green-600" />
                                {(
                                  parseFloat(store.total_purchases_eur) || 0
                                ).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3 text-blue-600" />
                                {store.total_orders || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <EnhancedButton
                                  onClick={() =>
                                    navigate(`/stores/${store.id}`)
                                  }
                                  variant="primary"
                                  size="sm"
                                  icon={<Eye className="w-3 h-3" />}
                                >
                                  عرض
                                </EnhancedButton>
                                <EnhancedButton
                                  onClick={() =>
                                    navigate(`/stores/edit/${store.id}`)
                                  }
                                  variant="warning"
                                  size="sm"
                                  icon={<Edit className="w-3 h-3" />}
                                >
                                  تعديل
                                </EnhancedButton>
                                <EnhancedButton
                                  onClick={() =>
                                    handleToggleStatus(store.id, store.status)
                                  }
                                  variant={
                                    store.status === "active"
                                      ? "danger"
                                      : "success"
                                  }
                                  size="sm"
                                  icon={
                                    store.status === "active" ? (
                                      <XCircle className="w-3 h-3" />
                                    ) : (
                                      <CheckCircle className="w-3 h-3" />
                                    )
                                  }
                                >
                                  {store.status === "active"
                                    ? "إلغاء التفعيل"
                                    : "تفعيل"}
                                </EnhancedButton>
                                <EnhancedButton
                                  onClick={() =>
                                    openDeleteModal(store.id, store.name)
                                  }
                                  variant="danger"
                                  size="sm"
                                  icon={<Trash2 className="w-3 h-3" />}
                                >
                                  حذف
                                </EnhancedButton>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    خريطة المتاجر
                  </h2>
                  <div className="flex gap-2">
                    <EnhancedButton
                      onClick={loadStores}
                      variant="secondary"
                      size="sm"
                      icon={<RefreshCw className="w-4 h-4" />}
                    >
                      تحديث
                    </EnhancedButton>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <div className="h-[600px]">
                  <StoreMap
                    stores={stores}
                    height="100%"
                    showControls={true}
                    interactive={true}
                    enableCurrentLocation={true}
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* التصفح */}
        {viewMode === "list" && pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 flex items-center justify-between bg-white p-4 rounded-xl shadow-lg"
          >
            <div className="text-sm text-gray-700">
              عرض {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
              إلى{" "}
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              من {pagination.totalItems} متجر
            </div>
            <div className="flex gap-2">
              <EnhancedButton
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage - 1,
                  }))
                }
                disabled={pagination.currentPage === 1}
                variant="secondary"
                size="sm"
              >
                السابق
              </EnhancedButton>
              <span className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg">
                صفحة {pagination.currentPage} من {pagination.totalPages}
              </span>
              <EnhancedButton
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                  }))
                }
                disabled={pagination.currentPage === pagination.totalPages}
                variant="secondary"
                size="sm"
              >
                التالي
              </EnhancedButton>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modal تأكيد الحذف */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="تأكيد حذف المتجر"
        message={`هل أنت متأكد من حذف المتجر "${deleteModal.storeName}"؟`}
        itemName={deleteModal.storeName}
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
};

export default StoresListPage;
