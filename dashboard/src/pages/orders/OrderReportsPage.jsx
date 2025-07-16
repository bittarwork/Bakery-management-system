import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Search,
  Eye,
  FileText,
  PieChart,
  LineChart,
  DollarSign,
  Package,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Euro,
  MapPin,
  ShoppingCart,
  CreditCard,
  Receipt,
  Tag,
  Star,
  Heart,
  Award,
  Shield,
  Info,
  AlertTriangle,
  Check,
  X,
  Minus,
  Plus,
  Settings,
  MoreVertical,
  Share,
  Copy,
  ExternalLink,
  Activity,
  History,
  Truck,
  Building,
  Globe,
  Calculator,
  Target,
  Zap,
  Bell,
  Mail,
  MessageSquare,
  Save,
  RotateCcw,
  Archive,
  Bookmark,
  Flag,
  Star as StarIcon,
  Heart as HeartIcon,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import EnhancedButton from "../../components/ui/EnhancedButton";
import EnhancedInput from "../../components/ui/EnhancedInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import orderService from "../../services/orderService";

const OrderReportsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // فلاتر التقارير
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    payment_status: "",
    order_status: "",
    currency: "",
    min_amount: "",
    max_amount: "",
  });

  // بيانات التقارير
  const [reports, setReports] = useState({
    summary: {
      total_orders: 0,
      total_revenue: 0,
      average_order_value: 0,
      total_customers: 0,
    },
    trends: {
      daily: [],
      weekly: [],
      monthly: [],
    },
    status_distribution: {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    },
    payment_distribution: {
      paid: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
    },
    top_products: [],
    top_customers: [],
    revenue_by_currency: {
      EUR: 0,
      SYP: 0,
    },
  });

  // تحميل البيانات
  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await orderService.getOrderReports(filters);

      if (response.success) {
        setReports(response.data);
      } else {
        setError(response.message || "خطأ في تحميل التقارير");
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      setError("خطأ في تحميل التقارير");
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة تغيير الفلاتر
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // معالجة البحث
  const handleSearch = (e) => {
    e.preventDefault();
    loadReports();
  };

  // تصدير التقارير
  const handleExport = async (format = "json", reportType = "summary") => {
    try {
      setIsExporting(true);
      setError("");

      const response = await orderService.exportOrderReports(
        format,
        reportType,
        filters
      );

      if (response.success) {
        if (format === "csv") {
          const blob = new Blob([response.data], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `order_reports_${reportType}_${
            new Date().toISOString().split("T")[0]
          }.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          const dataStr = JSON.stringify(response.data, null, 2);
          const blob = new Blob([dataStr], { type: "application/json" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `order_reports_${reportType}_${
            new Date().toISOString().split("T")[0]
          }.json`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
        setSuccess(`تم تصدير التقرير بنجاح بصيغة ${format.toUpperCase()}`);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("خطأ في تصدير التقرير");
    } finally {
      setIsExporting(false);
    }
  };

  // تنسيق المبلغ
  const formatAmount = (amount, currency = "EUR") => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    });
    return formatter.format(amount);
  };

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // حساب النسبة المئوية
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  // الحصول على لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="xl" text="جاري تحميل التقارير..." />
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
                تقارير الطلبات
              </h1>
              <p className="text-gray-600 text-lg">
                تحليل شامل لبيانات الطلبات والمبيعات
              </p>
            </div>
            <EnhancedButton
              onClick={loadReports}
              disabled={isLoading}
              variant="primary"
              size="lg"
              icon={
                <RefreshCw
                  className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                />
              }
            >
              تحديث التقارير
            </EnhancedButton>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                        إجمالي الطلبات
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {reports.summary.total_orders}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <ShoppingCart className="w-8 h-8" />
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
                        إجمالي الإيرادات
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {formatAmount(reports.summary.total_revenue)}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <DollarSign className="w-8 h-8" />
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
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        متوسط قيمة الطلب
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {formatAmount(reports.summary.average_order_value)}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <TrendingUp className="w-8 h-8" />
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
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        إجمالي العملاء
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {reports.summary.total_customers}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Users className="w-8 h-8" />
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
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-semibold">فلاتر التقارير</h3>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <EnhancedInput
                    type="date"
                    value={filters.date_from}
                    onChange={(e) =>
                      handleFilterChange("date_from", e.target.value)
                    }
                    placeholder="من تاريخ"
                    icon={<Calendar className="w-4 h-4" />}
                    size="md"
                  />
                  <EnhancedInput
                    type="date"
                    value={filters.date_to}
                    onChange={(e) =>
                      handleFilterChange("date_to", e.target.value)
                    }
                    placeholder="إلى تاريخ"
                    icon={<Calendar className="w-4 h-4" />}
                    size="md"
                  />
                  <select
                    value={filters.payment_status}
                    onChange={(e) =>
                      handleFilterChange("payment_status", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع حالات الدفع</option>
                    <option value="paid">مدفوع</option>
                    <option value="pending">معلق</option>
                    <option value="failed">فاشل</option>
                    <option value="refunded">مسترد</option>
                  </select>
                  <select
                    value={filters.currency}
                    onChange={(e) =>
                      handleFilterChange("currency", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">جميع العملات</option>
                    <option value="EUR">يورو</option>
                    <option value="SYP">ليرة سورية</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <EnhancedButton
                    type="submit"
                    variant="primary"
                    icon={<Search className="w-4 h-4" />}
                  >
                    تطبيق الفلاتر
                  </EnhancedButton>
                  <div className="flex gap-2">
                    <EnhancedButton
                      onClick={() => handleExport("json", "summary")}
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
                      onClick={() => handleExport("csv", "summary")}
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
              </form>
            </CardBody>
          </Card>
        </motion.div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Order Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                    <h3 className="text-lg font-semibold">
                      توزيع حالات الطلبات
                    </h3>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-3">
                  {Object.entries(reports.status_distribution).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              status
                            )}`}
                          >
                            {status === "pending" && "معلق"}
                            {status === "processing" && "قيد المعالجة"}
                            {status === "completed" && "مكتمل"}
                            {status === "cancelled" && "ملغي"}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{count}</p>
                          <p className="text-sm text-gray-500">
                            {calculatePercentage(
                              count,
                              reports.summary.total_orders
                            )}
                            %
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Payment Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                    <h3 className="text-lg font-semibold">توزيع حالات الدفع</h3>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-3">
                  {Object.entries(reports.payment_distribution).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              status
                            )}`}
                          >
                            {status === "paid" && "مدفوع"}
                            {status === "pending" && "معلق"}
                            {status === "failed" && "فاشل"}
                            {status === "refunded" && "مسترد"}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{count}</p>
                          <p className="text-sm text-gray-500">
                            {calculatePercentage(
                              count,
                              reports.summary.total_orders
                            )}
                            %
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Top Products and Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                    <h3 className="text-lg font-semibold">أفضل المنتجات</h3>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                {reports.top_products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>لا توجد بيانات متاحة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.top_products.slice(0, 5).map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.total_quantity} وحدة
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatAmount(product.total_revenue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Top Customers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-600" />
                    <h3 className="text-lg font-semibold">أفضل العملاء</h3>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                {reports.top_customers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>لا توجد بيانات متاحة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.top_customers
                      .slice(0, 5)
                      .map((customer, index) => (
                        <div
                          key={customer.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {customer.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {customer.total_orders} طلب
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatAmount(customer.total_spent)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Revenue by Currency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Euro className="w-5 h-5 mr-2 text-yellow-600" />
                  <h3 className="text-lg font-semibold">
                    الإيرادات حسب العملة
                  </h3>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <Euro className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">يورو</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(reports.revenue_by_currency.EUR, "EUR")}
                  </p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    ليرة سورية
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(reports.revenue_by_currency.SYP, "SYP")}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderReportsPage;
