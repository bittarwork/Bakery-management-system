import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Store,
  Package,
  DollarSign,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  Calendar,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardHeader, CardBody } from "../ui/Card";
import LoadingSpinner from "../ui/LoadingSpinner";
import EnhancedButton from "../ui/EnhancedButton";
import { aiChatService } from "../../services/aiChatService";
import { reportsService } from "../../services/reportsService";

const DetailedReports = () => {
  const [activeReport, setActiveReport] = useState("profitability");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("last30days");
  const [selectedStore, setSelectedStore] = useState("all");
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const reportTypes = [
    {
      id: "profitability",
      title: "المنتجات الأكثر ربحية",
      icon: DollarSign,
      description: "تحليل أرباح المنتجات والهوامش",
    },
    {
      id: "peak_hours",
      title: "أوقات الذروة",
      icon: Clock,
      description: "تحليل أنماط المبيعات حسب الوقت",
    },
    {
      id: "store_performance",
      title: "أداء الفروع",
      icon: Store,
      description: "مقارنة أداء المتاجر المختلفة",
    },
    {
      id: "product_trends",
      title: "اتجاهات المنتجات",
      icon: TrendingUp,
      description: "تحليل اتجاهات الطلب على المنتجات",
    },
    {
      id: "customer_behavior",
      title: "سلوك العملاء",
      icon: Target,
      description: "تحليل أنماط شراء العملاء",
    },
    {
      id: "inventory_optimization",
      title: "تحسين المخزون",
      icon: Package,
      description: "توصيات لإدارة المخزون",
    },
  ];

  const dateRanges = [
    { value: "last7days", label: "آخر 7 أيام" },
    { value: "last30days", label: "آخر 30 يوم" },
    { value: "last90days", label: "آخر 3 أشهر" },
    { value: "thisyear", label: "هذا العام" },
  ];

  useEffect(() => {
    fetchReportData();
  }, [activeReport, dateRange, selectedStore]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch report data based on selected type
      const response = await reportsService.getDetailedReport({
        type: activeReport,
        dateRange,
        storeId: selectedStore === "all" ? null : selectedStore,
      });

      if (response.success) {
        setReportData(response.data);

        // Get AI analysis for the report
        const aiPrompt = generateAIPrompt(activeReport, response.data);
        const aiResponse = await aiChatService.sendMessage(aiPrompt);

        if (aiResponse && aiResponse.message) {
          setAiAnalysis(aiResponse.message);
        }
      }
    } catch (error) {
      console.error("خطأ في جلب تقرير مفصل:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIPrompt = (reportType, data) => {
    const prompts = {
      profitability: `حلل البيانات التالية للمنتجات الأكثر ربحية: ${JSON.stringify(
        data
      )}. قدم توصيات لزيادة الأرباح`,
      peak_hours: `حلل أوقات الذروة بناءً على البيانات: ${JSON.stringify(
        data
      )}. قدم استراتيجيات لتحسين الكفاءة`,
      store_performance: `حلل أداء الفروع: ${JSON.stringify(
        data
      )}. حدد نقاط القوة والضعف وقدم توصيات`,
      product_trends: `حلل اتجاهات المنتجات: ${JSON.stringify(
        data
      )}. تنبأ بالاتجاهات المستقبلية`,
      customer_behavior: `حلل سلوك العملاء: ${JSON.stringify(
        data
      )}. قدم رؤى لتحسين تجربة العملاء`,
      inventory_optimization: `حلل بيانات المخزون: ${JSON.stringify(
        data
      )}. قدم توصيات للتحسين`,
    };

    return prompts[reportType] || "حلل البيانات المقدمة وقدم رؤى مفيدة";
  };

  const handleExportReport = async () => {
    try {
      await reportsService.exportReport({
        type: activeReport,
        data: reportData,
        dateRange,
        format: "pdf",
      });
    } catch (error) {
      console.error("خطأ في تصدير التقرير:", error);
    }
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="text-center py-8">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد بيانات متاحة</p>
        </div>
      );
    }

    switch (activeReport) {
      case "profitability":
        return renderProfitabilityReport();
      case "peak_hours":
        return renderPeakHoursReport();
      case "store_performance":
        return renderStorePerformanceReport();
      case "product_trends":
        return renderProductTrendsReport();
      case "customer_behavior":
        return renderCustomerBehaviorReport();
      case "inventory_optimization":
        return renderInventoryOptimizationReport();
      default:
        return null;
    }
  };

  const renderProfitabilityReport = () => {
    const { products, summary } = reportData;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-green-600">إجمالي الأرباح</p>
                  <p className="text-xl font-bold text-green-800">
                    {summary?.totalProfit?.toFixed(2)} €
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-blue-600">أفضل منتج</p>
                  <p className="text-lg font-bold text-blue-800">
                    {summary?.topProduct?.name}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-purple-600">متوسط الهامش</p>
                  <p className="text-xl font-bold text-purple-800">
                    {summary?.averageMargin?.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Products Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">أرباح المنتجات</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={products}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis yAxisId="profit" orientation="left" />
                  <YAxis yAxisId="margin" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="profit"
                    dataKey="profit"
                    fill="#10B981"
                    name="الربح (€)"
                  />
                  <Line
                    yAxisId="margin"
                    type="monotone"
                    dataKey="margin"
                    stroke="#8B5CF6"
                    name="الهامش (%)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Top Products Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">المنتجات الأكثر ربحية</h3>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">المنتج</th>
                    <th className="text-right p-2">المبيعات</th>
                    <th className="text-right p-2">الربح</th>
                    <th className="text-right p-2">الهامش</th>
                    <th className="text-right p-2">الاتجاه</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.slice(0, 10).map((product, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{product.name}</td>
                      <td className="p-2">{product.sales}</td>
                      <td className="p-2 text-green-600">
                        {product.profit?.toFixed(2)} €
                      </td>
                      <td className="p-2">{product.margin?.toFixed(1)}%</td>
                      <td className="p-2">
                        {product.trend > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderPeakHoursReport = () => {
    const { hourlyData, summary } = reportData;

    return (
      <div className="space-y-6">
        {/* Peak Hours Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">توزيع المبيعات حسب الساعة</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient
                      id="colorOrders"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                    name="عدد الطلبات"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Peak Hours Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-yellow-600">ذروة الصباح</p>
                  <p className="text-lg font-bold text-yellow-800">
                    {summary?.morningPeak}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-orange-600">ذروة الظهر</p>
                  <p className="text-lg font-bold text-orange-800">
                    {summary?.afternoonPeak}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-sm text-red-600">ذروة المساء</p>
                  <p className="text-lg font-bold text-red-800">
                    {summary?.eveningPeak}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">أقل نشاط</p>
                  <p className="text-lg font-bold text-gray-800">
                    {summary?.lowestActivity}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  };

  const renderStorePerformanceReport = () => {
    const { stores, comparison } = reportData;

    return (
      <div className="space-y-6">
        {/* Store Comparison Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">مقارنة أداء الفروع</h3>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="revenue" orientation="left" />
                  <YAxis yAxisId="orders" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="revenue"
                    dataKey="revenue"
                    fill="#10B981"
                    name="الإيرادات (€)"
                  />
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    stroke="#F59E0B"
                    name="عدد الطلبات"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Store Performance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores?.map((store, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">{store.name}</h4>
                  <Store className="w-6 h-6 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الإيرادات:</span>
                    <span className="font-semibold">
                      {store.revenue?.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الطلبات:</span>
                    <span className="font-semibold">{store.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">متوسط الطلب:</span>
                    <span className="font-semibold">
                      {store.averageOrder?.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الأداء:</span>
                    <div className="flex items-center gap-1">
                      {store.performance > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm ${
                          store.performance > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {Math.abs(store.performance).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Other render methods would be similar...
  const renderProductTrendsReport = () => (
    <div className="text-center py-8">
      <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">تقرير اتجاهات المنتجات قيد التطوير</p>
    </div>
  );

  const renderCustomerBehaviorReport = () => (
    <div className="text-center py-8">
      <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">تقرير سلوك العملاء قيد التطوير</p>
    </div>
  );

  const renderInventoryOptimizationReport = () => (
    <div className="text-center py-8">
      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">تقرير تحسين المخزون قيد التطوير</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            التقارير التفصيلية
          </h2>
          <p className="text-gray-600">
            تحليلات متقدمة ورؤى تفصيلية لأداء المخبز
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <EnhancedButton
            onClick={handleExportReport}
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={!reportData}
          >
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </EnhancedButton>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <motion.div
            key={report.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all ${
                activeReport === report.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:shadow-md"
              }`}
              onClick={() => setActiveReport(report.id)}
            >
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <report.icon
                    className={`w-8 h-8 ${
                      activeReport === report.id
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {report.description}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Report Content */}
      <Card>
        <CardBody className="p-6">{renderReportContent()}</CardBody>
      </Card>

      {/* AI Analysis */}
      {aiAnalysis && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">تحليل ذكي</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="prose prose-sm max-w-none text-gray-700">
              <div className="whitespace-pre-wrap">{aiAnalysis}</div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default DetailedReports;
