import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Store,
  Users,
  Calendar,
  Clock,
  FileText,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Search,
  PieChart,
  Activity,
  Target,
  Map,
  Archive,
  Brain,
  Navigation,
  MapPin,
  Route,
  TruckIcon,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ReportsSystem from "../../components/distribution/ReportsSystem";
import MapsSystem from "../../components/distribution/MapsSystem";
import ArchiveSystem from "../../components/distribution/ArchiveSystem";

const ReportsOverviewPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [currentView, setCurrentView] = useState("overview");
  const [filters, setFilters] = useState({
    store: "",
    category: "",
    dateRange: "",
  });

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const stats = {
    totalSales: 15250.0,
    totalOrders: 1247,
    activeStores: 24,
    avgOrderValue: 12.24,
    salesGrowth: 8.5,
    ordersGrowth: 12,
    storesGrowth: 2,
    avgOrderGrowth: -2.1,
  };

  // Navigation tabs for advanced reports
  const reportTabs = [
    { key: "overview", label: "نظرة عامة", icon: BarChart3 },
    { key: "distribution", label: "تقارير التوزيع", icon: FileText },
    { key: "maps", label: "الخرائط والمسارات", icon: Map },
    { key: "analytics", label: "التحليلات المتقدمة", icon: Brain },
    { key: "archive", label: "أرشيف العمليات", icon: Archive },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-7 h-7 text-blue-600 ml-3" />
                التقارير المتقدمة
              </h1>
              <p className="text-gray-600 mt-1">
                تقارير شاملة وتحليلات متقدمة لجميع عمليات النظام
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Clock className="w-4 h-4 text-gray-600 ml-2" />
                <span className="text-sm font-medium">
                  {new Date().toLocaleTimeString("ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <Button
                variant="secondary"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border-0 shadow-lg mb-6 overflow-hidden"
        >
          <div className="flex overflow-x-auto">
            {reportTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentView(tab.key)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  currentView === tab.key
                    ? "text-blue-600 border-blue-600 bg-blue-50"
                    : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <tab.icon className="w-4 h-4 ml-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Content */}
          {currentView === "overview" && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">إجمالي المبيعات</p>
                        <p className="text-2xl font-bold">€{stats.totalSales.toLocaleString()}</p>
                        <p className="text-blue-100 text-sm flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 ml-1" />
                          +{stats.salesGrowth}%
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardBody>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">إجمالي الطلبات</p>
                        <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</p>
                        <p className="text-green-100 text-sm flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 ml-1" />
                          +{stats.ordersGrowth}%
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-green-200" />
                    </div>
                  </CardBody>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">المتاجر النشطة</p>
                        <p className="text-2xl font-bold">{stats.activeStores}</p>
                        <p className="text-purple-100 text-sm flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 ml-1" />
                          +{stats.storesGrowth}
                        </p>
                      </div>
                      <Store className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardBody>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">متوسط قيمة الطلب</p>
                        <p className="text-2xl font-bold">€{stats.avgOrderValue}</p>
                        <p className="text-orange-100 text-sm flex items-center mt-1">
                          <TrendingDown className="w-3 h-3 ml-1" />
                          {stats.avgOrderGrowth}%
                        </p>
                      </div>
                      <Target className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Quick Report Access */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView("distribution")}>
                  <CardBody className="p-6 text-center">
                    <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">تقارير التوزيع</h3>
                    <p className="text-sm text-gray-600">تقارير يومية وأسبوعية وشهرية</p>
                  </CardBody>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView("maps")}>
                  <CardBody className="p-6 text-center">
                    <Map className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">الخرائط والمسارات</h3>
                    <p className="text-sm text-gray-600">تتبع وتحليل المسارات</p>
                  </CardBody>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView("analytics")}>
                  <CardBody className="p-6 text-center">
                    <Brain className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">التحليلات المتقدمة</h3>
                    <p className="text-sm text-gray-600">ذكاء الأعمال والتحليلات</p>
                  </CardBody>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView("archive")}>
                  <CardBody className="p-6 text-center">
                    <Archive className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 mb-2">أرشيف العمليات</h3>
                    <p className="text-sm text-gray-600">أرشيف شامل للبيانات</p>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {/* Distribution Reports */}
          {currentView === "distribution" && <ReportsSystem />}

          {/* Maps and Routes */}
          {currentView === "maps" && <MapsSystem />}

          {/* Analytics */}
          {currentView === "analytics" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Brain className="w-5 h-5 text-purple-600 ml-2" />
                    التحليلات المتقدمة
                  </h2>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales Overview */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        نظرة عامة على المبيعات
                      </h3>
                      <div className="flex items-center justify-center h-40 bg-white rounded border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <PieChart className="w-8 h-8 mx-auto mb-2" />
                          <p>الرسم البياني سيظهر هنا</p>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Trends */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        اتجاهات الإيرادات
                      </h3>
                      <div className="flex items-center justify-center h-40 bg-white rounded border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                          <p>الرسم البياني سيظهر هنا</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        مقاييس الأداء
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">معدل النمو الشهري</span>
                          <span className="font-semibold text-green-600">+{stats.salesGrowth}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">كفاءة التوزيع</span>
                          <span className="font-semibold text-blue-600">87%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">رضا العملاء</span>
                          <span className="font-semibold text-purple-600">4.2/5</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        المنتجات الأكثر مبيعاً
                      </h3>
                      <div className="text-center text-gray-500 py-8">
                        لا توجد بيانات متاحة
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Archive */}
          {currentView === "archive" && <ArchiveSystem />}
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsOverviewPage;
