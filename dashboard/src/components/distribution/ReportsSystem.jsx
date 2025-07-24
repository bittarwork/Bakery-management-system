import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  Eye,
  Printer,
  Share2,
  Clock,
  Package,
  Truck,
  Euro,
  Users,
  Store,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  MapPin,
  Timer,
  Star,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import { toast } from "react-hot-toast";

const ReportsSystem = ({ selectedDate }) => {
  const [activeTab, setActiveTab] = useState("daily");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState({
    daily: null,
    weekly: null,
    monthly: null,
    comparative: null,
  });

  const [filters, setFilters] = useState({
    dateRange: "today",
    reportType: "all",
    distributor: "",
    store: "",
    status: "",
  });

  const [selectedReportType, setSelectedReportType] = useState("overview");

  useEffect(() => {
    loadReportData();
  }, [activeTab, filters, selectedDate]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // Mock data - سيتم استبداله بـ API calls حقيقية
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData = {
        daily: {
          summary: {
            totalOrders: 45,
            completedOrders: 38,
            pendingOrders: 7,
            totalRevenue: 2850.5,
            averageOrderValue: 63.34,
            deliveryRate: 84.4,
            customerSatisfaction: 4.2,
          },
          ordersByHour: [
            { hour: "08:00", orders: 5, revenue: 315 },
            { hour: "09:00", orders: 8, revenue: 512 },
            { hour: "10:00", orders: 12, revenue: 768 },
            { hour: "11:00", orders: 15, revenue: 950 },
            { hour: "12:00", orders: 3, revenue: 189 },
            { hour: "13:00", orders: 2, revenue: 116 },
          ],
          topProducts: [
            { name: "خبز عربي", quantity: 120, revenue: 360 },
            { name: "كعك محلى", quantity: 85, revenue: 680 },
            { name: "معجنات", quantity: 65, revenue: 455 },
          ],
          distributorPerformance: [
            { name: "أحمد محمد", orders: 15, completionRate: 93, revenue: 980 },
            { name: "سارة أحمد", orders: 12, completionRate: 88, revenue: 756 },
            { name: "محمد علي", orders: 11, completionRate: 91, revenue: 714 },
          ],
        },
        weekly: {
          summary: {
            totalOrders: 315,
            completedOrders: 267,
            pendingOrders: 48,
            totalRevenue: 19950.75,
            averageOrderValue: 63.34,
            deliveryRate: 84.8,
            customerSatisfaction: 4.1,
          },
          dailyTrend: [
            { day: "الأحد", orders: 42, revenue: 2680 },
            { day: "الاثنين", orders: 48, revenue: 3040 },
            { day: "الثلاثاء", orders: 45, revenue: 2850 },
            { day: "الأربعاء", orders: 52, revenue: 3380 },
            { day: "الخميس", orders: 49, revenue: 3115 },
            { day: "الجمعة", orders: 44, revenue: 2790 },
            { day: "السبت", orders: 35, revenue: 2095 },
          ],
        },
      };

      setReportData((prev) => ({
        ...prev,
        [activeTab]: mockData[activeTab],
      }));
    } catch (error) {
      toast.error("خطأ في تحميل بيانات التقرير");
      console.error("Error loading report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      toast.loading("جاري تصدير التقرير...");
      // Mock export - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.dismiss();
      toast.success(`تم تصدير التقرير بتنسيق ${format} بنجاح`);
    } catch (error) {
      toast.dismiss();
      toast.error("خطأ في تصدير التقرير");
    }
  };

  const reportTabs = [
    { key: "daily", label: "التقرير اليومي", icon: Calendar },
    { key: "weekly", label: "التقرير الأسبوعي", icon: BarChart3 },
    { key: "monthly", label: "التقرير الشهري", icon: TrendingUp },
    { key: "comparative", label: "تقرير مقارن", icon: PieChart },
  ];

  const reportTypes = [
    { key: "overview", label: "نظرة عامة", icon: Eye },
    { key: "detailed", label: "تقرير مفصل", icon: FileText },
    { key: "performance", label: "تقرير الأداء", icon: TrendingUp },
    { key: "financial", label: "التقرير المالي", icon: Euro },
  ];

  const SummaryCard = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    color,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border-0 shadow-lg overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${getColorGradient(color)} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{title}</p>
            <p className="text-white text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {change && (
          <div className="flex items-center mt-3">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                changeType === "positive"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {change}
            </span>
            <span className="text-white/80 text-xs mr-2">
              من الفترة السابقة
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  const getColorGradient = (color) => {
    const gradients = {
      blue: "from-blue-600 to-blue-700",
      green: "from-green-600 to-green-700",
      purple: "from-purple-600 to-purple-700",
      orange: "from-orange-600 to-orange-700",
      red: "from-red-600 to-red-700",
      indigo: "from-indigo-600 to-indigo-700",
    };
    return gradients[color] || gradients.blue;
  };

  const DailyReport = () => {
    const data = reportData.daily;
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="إجمالي الطلبات"
            value={data.summary.totalOrders}
            change="+12%"
            changeType="positive"
            icon={Package}
            color="blue"
          />
          <SummaryCard
            title="الطلبات المكتملة"
            value={data.summary.completedOrders}
            change="+8%"
            changeType="positive"
            icon={CheckCircle}
            color="green"
          />
          <SummaryCard
            title="إجمالي الإيرادات"
            value={`€${data.summary.totalRevenue.toFixed(2)}`}
            change="+15%"
            changeType="positive"
            icon={Euro}
            color="purple"
          />
          <SummaryCard
            title="معدل التوصيل"
            value={`${data.summary.deliveryRate}%`}
            change="-2%"
            changeType="negative"
            icon={Truck}
            color="orange"
          />
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Hour */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 text-blue-600 ml-2" />
                الطلبات حسب الساعة
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                {data.ordersByHour.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 w-16">
                        {item.hour}
                      </span>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(item.orders / 15) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.orders} طلب
                      </p>
                      <p className="text-xs text-gray-500">€{item.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Top Products */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Star className="w-5 h-5 text-green-600 ml-2" />
                أفضل المنتجات
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : "bg-orange-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="mr-3">
                        <p className="font-semibold text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.quantity} قطعة
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">
                        €{product.revenue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Distributor Performance */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Users className="w-5 h-5 text-purple-600 ml-2" />
              أداء الموزعين
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      الموزع
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      عدد الطلبات
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      معدل الإكمال
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      الإيرادات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.distributorPerformance.map((distributor, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {distributor.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {distributor.orders}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            distributor.completionRate >= 90
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {distributor.completionRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600">
                        €{distributor.revenue}
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

  const WeeklyReport = () => {
    const data = reportData.weekly;
    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="إجمالي الطلبات الأسبوعية"
            value={data.summary.totalOrders}
            change="+18%"
            changeType="positive"
            icon={Package}
            color="blue"
          />
          <SummaryCard
            title="متوسط الطلبات اليومية"
            value={Math.round(data.summary.totalOrders / 7)}
            change="+5%"
            changeType="positive"
            icon={BarChart3}
            color="green"
          />
          <SummaryCard
            title="إجمالي الإيرادات"
            value={`€${data.summary.totalRevenue.toFixed(2)}`}
            change="+22%"
            changeType="positive"
            icon={Euro}
            color="purple"
          />
          <SummaryCard
            title="رضا العملاء"
            value={`${data.summary.customerSatisfaction}/5`}
            change="+0.2"
            changeType="positive"
            icon={Star}
            color="orange"
          />
        </div>

        {/* Daily Trend Chart */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 text-indigo-600 ml-2" />
              الاتجاه اليومي للطلبات والإيرادات
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              {data.dailyTrend.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-20">
                      {day.day}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full"
                          style={{ width: `${(day.orders / 52) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {day.orders} طلب
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      €{day.revenue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const MonthlyReport = () => {
    const data = reportData.monthly;
    if (!data) {
      // Load monthly data if not available
      useEffect(() => {
        if (activeTab === "monthly" && !reportData.monthly) {
          const loadMonthlyData = async () => {
            const mockMonthlyData = {
              summary: {
                totalOrders: 1380,
                completedOrders: 1295,
                totalRevenue: 87650.25,
                averageOrderValue: 63.55,
                deliveryRate: 93.8,
                customerSatisfaction: 4.3,
                newCustomers: 145,
                returningCustomers: 1235,
              },
              weeklyTrend: [
                { week: "الأسبوع الأول", orders: 320, revenue: 20380 },
                { week: "الأسبوع الثاني", orders: 365, revenue: 23200 },
                { week: "الأسبوع الثالث", orders: 342, revenue: 21750 },
                { week: "الأسبوع الرابع", orders: 353, revenue: 22320 },
              ],
              topPerformers: [
                {
                  name: "أحمد محمد",
                  orders: 85,
                  revenue: 5440,
                  efficiency: 96,
                },
                {
                  name: "سارة أحمد",
                  orders: 78,
                  revenue: 4980,
                  efficiency: 92,
                },
                { name: "محمد علي", orders: 82, revenue: 5200, efficiency: 94 },
              ],
              productAnalysis: [
                {
                  category: "خبز عربي",
                  orders: 450,
                  revenue: 13500,
                  growth: "+12%",
                },
                {
                  category: "معجنات",
                  orders: 320,
                  revenue: 9600,
                  growth: "+8%",
                },
                {
                  category: "حلويات",
                  orders: 280,
                  revenue: 11200,
                  growth: "+15%",
                },
              ],
            };
            setReportData((prev) => ({ ...prev, monthly: mockMonthlyData }));
          };
          loadMonthlyData();
        }
      }, [activeTab]);

      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل التقرير الشهري...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="إجمالي الطلبات الشهرية"
            value={data.summary.totalOrders}
            change="+24%"
            changeType="positive"
            icon={Package}
            color="blue"
          />
          <SummaryCard
            title="العملاء الجدد"
            value={data.summary.newCustomers}
            change="+18%"
            changeType="positive"
            icon={Users}
            color="green"
          />
          <SummaryCard
            title="إجمالي الإيرادات"
            value={`€${data.summary.totalRevenue.toFixed(2)}`}
            change="+31%"
            changeType="positive"
            icon={Euro}
            color="purple"
          />
          <SummaryCard
            title="معدل التوصيل"
            value={`${data.summary.deliveryRate}%`}
            change="+3%"
            changeType="positive"
            icon={Truck}
            color="orange"
          />
        </div>

        {/* Weekly Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-600 ml-2" />
              الاتجاه الأسبوعي
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              {data.weeklyTrend.map((week, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-32">
                      {week.week}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-600 h-3 rounded-full"
                          style={{ width: `${(week.orders / 365) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {week.orders} طلب
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      €{week.revenue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Top Performers and Product Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Star className="w-5 h-5 text-green-600 ml-2" />
                أفضل الموزعين
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                {data.topPerformers.map((performer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : "bg-orange-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="mr-3">
                        <p className="font-semibold text-gray-900">
                          {performer.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {performer.orders} طلب - {performer.efficiency}% كفاءة
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">
                        €{performer.revenue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 text-purple-600 ml-2" />
                تحليل المنتجات
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                {data.productAnalysis.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.category}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.orders} طلب
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">
                        €{product.revenue}
                      </p>
                      <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {product.growth}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  };

  const ComparativeReport = () => {
    const data = reportData.comparative;
    if (!data) {
      // Load comparative data if not available
      useEffect(() => {
        if (activeTab === "comparative" && !reportData.comparative) {
          const loadComparativeData = async () => {
            const mockComparativeData = {
              periods: {
                current: {
                  label: "هذا الشهر",
                  orders: 1380,
                  revenue: 87650.25,
                },
                previous: {
                  label: "الشهر السابق",
                  orders: 1245,
                  revenue: 79820.5,
                },
                lastYear: {
                  label: "نفس الشهر العام السابق",
                  orders: 1150,
                  revenue: 73400.75,
                },
              },
              comparison: {
                ordersGrowth: "+10.8%",
                revenueGrowth: "+9.8%",
                yearOverYearOrdersGrowth: "+20.0%",
                yearOverYearRevenueGrowth: "+19.4%",
              },
              distributorComparison: [
                {
                  name: "أحمد محمد",
                  current: { orders: 85, revenue: 5440 },
                  previous: { orders: 78, revenue: 4980 },
                  growth: "+8.9%",
                },
                {
                  name: "سارة أحمد",
                  current: { orders: 78, revenue: 4980 },
                  previous: { orders: 72, revenue: 4620 },
                  growth: "+7.8%",
                },
                {
                  name: "محمد علي",
                  current: { orders: 82, revenue: 5200 },
                  previous: { orders: 75, revenue: 4800 },
                  growth: "+8.3%",
                },
              ],
              categoryComparison: [
                {
                  category: "خبز عربي",
                  current: 13500,
                  previous: 12800,
                  change: "+5.5%",
                  changeType: "positive",
                },
                {
                  category: "معجنات",
                  current: 9600,
                  previous: 8900,
                  change: "+7.9%",
                  changeType: "positive",
                },
                {
                  category: "حلويات",
                  current: 11200,
                  previous: 9800,
                  change: "+14.3%",
                  changeType: "positive",
                },
              ],
            };
            setReportData((prev) => ({
              ...prev,
              comparative: mockComparativeData,
            }));
          };
          loadComparativeData();
        }
      }, [activeTab]);

      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل التقرير المقارن...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Period Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg">
            <CardBody className="p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">
                {data.periods.current.label}
              </h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {data.periods.current.orders}
                </p>
                <p className="text-sm text-gray-600">طلب</p>
                <p className="text-xl font-bold text-green-600">
                  €{data.periods.current.revenue.toFixed(2)}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardBody className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-600 mb-4">
                {data.periods.previous.label}
              </h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-700">
                  {data.periods.previous.orders}
                </p>
                <p className="text-sm text-gray-600">طلب</p>
                <p className="text-xl font-bold text-gray-700">
                  €{data.periods.previous.revenue.toFixed(2)}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardBody className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-600 mb-4">
                {data.periods.lastYear.label}
              </h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-700">
                  {data.periods.lastYear.orders}
                </p>
                <p className="text-sm text-gray-600">طلب</p>
                <p className="text-xl font-bold text-gray-700">
                  €{data.periods.lastYear.revenue.toFixed(2)}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Growth Metrics */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 ml-2" />
              مؤشرات النمو
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {data.comparison.ordersGrowth}
                </p>
                <p className="text-sm text-gray-600">نمو الطلبات الشهري</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {data.comparison.revenueGrowth}
                </p>
                <p className="text-sm text-gray-600">نمو الإيرادات الشهري</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {data.comparison.yearOverYearOrdersGrowth}
                </p>
                <p className="text-sm text-gray-600">نمو الطلبات السنوي</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {data.comparison.yearOverYearRevenueGrowth}
                </p>
                <p className="text-sm text-gray-600">نمو الإيرادات السنوي</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Distributor and Category Comparisons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Users className="w-5 h-5 text-blue-600 ml-2" />
                مقارنة أداء الموزعين
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                {data.distributorComparison.map((distributor, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {distributor.name}
                      </span>
                      <span className="text-sm font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {distributor.growth}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          الحالي: {distributor.current.orders} طلب
                        </p>
                        <p className="text-gray-600">
                          السابق: {distributor.previous.orders} طلب
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-green-600 font-medium">
                          €{distributor.current.revenue}
                        </p>
                        <p className="text-gray-600">
                          €{distributor.previous.revenue}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 text-purple-600 ml-2" />
                مقارنة الفئات
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                {data.categoryComparison.map((category, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {category.category}
                      </span>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded-full ${
                          category.changeType === "positive"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.change}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${(category.current / 15000) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-gray-600">
                          الحالي: €{category.current}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-gray-600">
                          السابق: €{category.previous}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 text-blue-600 ml-2" />
            نظام التقارير الشامل
          </h2>
          <p className="text-gray-600 mt-1">
            تقارير تفصيلية لجميع عمليات التوزيع
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EnhancedButton
            onClick={() => exportReport("PDF")}
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
          >
            تصدير PDF
          </EnhancedButton>
          <EnhancedButton
            onClick={() => exportReport("Excel")}
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
          >
            تصدير Excel
          </EnhancedButton>
        </div>
      </div>

      {/* Report Tabs */}
      <Card className="border-0 shadow-lg">
        <div className="flex overflow-x-auto">
          {reportTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-blue-600 border-blue-600 bg-blue-50"
                  : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <tab.icon className="w-4 h-4 ml-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Report Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 ml-3" />
              <span className="text-gray-600">جاري تحميل التقرير...</span>
            </div>
          ) : (
            <>
              {activeTab === "daily" && <DailyReport />}
              {activeTab === "weekly" && <WeeklyReport />}
              {activeTab === "monthly" && <MonthlyReport />}
              {activeTab === "comparative" && <ComparativeReport />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ReportsSystem;
