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
  Star
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
    comparative: null
  });
  
  const [filters, setFilters] = useState({
    dateRange: "today",
    reportType: "all",
    distributor: "",
    store: "",
    status: ""
  });

  const [selectedReportType, setSelectedReportType] = useState("overview");

  useEffect(() => {
    loadReportData();
  }, [activeTab, filters, selectedDate]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // Mock data - سيتم استبداله بـ API calls حقيقية
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        daily: {
          summary: {
            totalOrders: 45,
            completedOrders: 38,
            pendingOrders: 7,
            totalRevenue: 2850.50,
            averageOrderValue: 63.34,
            deliveryRate: 84.4,
            customerSatisfaction: 4.2
          },
          ordersByHour: [
            { hour: "08:00", orders: 5, revenue: 315 },
            { hour: "09:00", orders: 8, revenue: 512 },
            { hour: "10:00", orders: 12, revenue: 768 },
            { hour: "11:00", orders: 15, revenue: 950 },
            { hour: "12:00", orders: 3, revenue: 189 },
            { hour: "13:00", orders: 2, revenue: 116 }
          ],
          topProducts: [
            { name: "خبز عربي", quantity: 120, revenue: 360 },
            { name: "كعك محلى", quantity: 85, revenue: 680 },
            { name: "معجنات", quantity: 65, revenue: 455 }
          ],
          distributorPerformance: [
            { name: "أحمد محمد", orders: 15, completionRate: 93, revenue: 980 },
            { name: "سارة أحمد", orders: 12, completionRate: 88, revenue: 756 },
            { name: "محمد علي", orders: 11, completionRate: 91, revenue: 714 }
          ]
        },
        weekly: {
          summary: {
            totalOrders: 315,
            completedOrders: 267,
            pendingOrders: 48,
            totalRevenue: 19950.75,
            averageOrderValue: 63.34,
            deliveryRate: 84.8,
            customerSatisfaction: 4.1
          },
          dailyTrend: [
            { day: "الأحد", orders: 42, revenue: 2680 },
            { day: "الاثنين", orders: 48, revenue: 3040 },
            { day: "الثلاثاء", orders: 45, revenue: 2850 },
            { day: "الأربعاء", orders: 52, revenue: 3380 },
            { day: "الخميس", orders: 49, revenue: 3115 },
            { day: "الجمعة", orders: 44, revenue: 2790 },
            { day: "السبت", orders: 35, revenue: 2095 }
          ]
        }
      };
      
      setReportData(prev => ({
        ...prev,
        [activeTab]: mockData[activeTab]
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
      await new Promise(resolve => setTimeout(resolve, 2000));
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
    { key: "comparative", label: "تقرير مقارن", icon: PieChart }
  ];

  const reportTypes = [
    { key: "overview", label: "نظرة عامة", icon: Eye },
    { key: "detailed", label: "تقرير مفصل", icon: FileText },
    { key: "performance", label: "تقرير الأداء", icon: TrendingUp },
    { key: "financial", label: "التقرير المالي", icon: Euro }
  ];

  const SummaryCard = ({ title, value, change, changeType, icon: Icon, color }) => (
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
            <span className="text-white/80 text-xs mr-2">من الفترة السابقة</span>
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
      indigo: "from-indigo-600 to-indigo-700"
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
                  <div key={index} className="flex items-center justify-between">
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
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="mr-3">
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.quantity} قطعة</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">€{product.revenue}</p>
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
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">الموزع</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">عدد الطلبات</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">معدل الإكمال</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">الإيرادات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.distributorPerformance.map((distributor, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{distributor.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{distributor.orders}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          distributor.completionRate >= 90 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {distributor.completionRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600">€{distributor.revenue}</td>
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
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-20">{day.day}</span>
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
                    <p className="text-sm font-semibold text-gray-900">{day.orders} طلب</p>
                    <p className="text-xs text-green-600 font-medium">€{day.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
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
          <p className="text-gray-600 mt-1">تقارير تفصيلية لجميع عمليات التوزيع</p>
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
              {activeTab === "monthly" && (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">التقرير الشهري</h3>
                  <p className="text-gray-600">قيد التطوير...</p>
                </div>
              )}
              {activeTab === "comparative" && (
                <div className="text-center py-12">
                  <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">التقرير المقارن</h3>
                  <p className="text-gray-600">قيد التطوير...</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ReportsSystem; 