import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Archive,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  FileText,
  Clock,
  User,
  Package,
  Truck,
  Euro,
  BarChart3,
  TrendingUp,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Folder,
  File,
  History,
  Database,
  Settings,
  Plus,
  Users
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import { toast } from "react-hot-toast";

const ArchiveSystem = ({ selectedDate }) => {
  const [activeSection, setActiveSection] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [archiveData, setArchiveData] = useState({
    operations: [],
    reports: [],
    analytics: {},
    summary: {}
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    dateRange: "last_30_days",
    category: "all",
    status: "all",
    distributor: "all",
    type: "all"
  });

  useEffect(() => {
    loadArchiveData();
  }, [filters]);

  const loadArchiveData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockData = {
        summary: {
          totalOperations: 1250,
          totalRevenue: 89500.75,
          completedOrders: 1180,
          totalDistributors: 15,
          averageDeliveryTime: "45 دقيقة",
          successRate: 94.4
        },
        operations: [
          {
            id: 1,
            date: "2024-01-15",
            time: "09:30",
            type: "distribution",
            category: "daily_operations",
            title: "توزيع يومي - المنطقة الشمالية",
            distributor: "أحمد محمد",
            status: "completed",
            orders: 12,
            revenue: 890.50,
            duration: "4 ساعات 15 دقيقة",
            notes: "تم التوزيع بنجاح مع تأخير بسيط بسبب الزحام"
          },
          {
            id: 2,
            date: "2024-01-15",
            time: "08:15",
            type: "route_optimization",
            category: "system",
            title: "تحسين مسار توزيع المنطقة الجنوبية",
            distributor: "سارة أحمد",
            status: "completed",
            orders: 8,
            revenue: 567.25,
            duration: "توفير 25 دقيقة",
            notes: "تم تحسين المسار وتوفير الوقت والوقود"
          }
        ],
        reports: [
          {
            id: 1,
            name: "تقرير التوزيع الأسبوعي",
            date: "2024-01-15",
            type: "weekly",
            size: "2.4 MB",
            status: "available"
          }
        ],
        analytics: {
          operationsByType: [
            { type: "توزيع يومي", count: 450, percentage: 36 },
            { type: "توصيل خاص", count: 320, percentage: 25.6 }
          ]
        }
      };
      
      setArchiveData(mockData);
    } catch (error) {
      toast.error("خطأ في تحميل بيانات الأرشيف");
    } finally {
      setIsLoading(false);
    }
  };

  const archiveSections = [
    { key: "overview", label: "نظرة عامة", icon: Eye },
    { key: "operations", label: "العمليات", icon: History },
    { key: "reports", label: "التقارير", icon: FileText },
    { key: "analytics", label: "التحليلات", icon: BarChart3 }
  ];

  const OverviewSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي العمليات</p>
                <p className="text-2xl font-bold text-blue-600">{archiveData.summary.totalOperations}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <History className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">€{archiveData.summary.totalRevenue?.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Euro className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">معدل النجاح</p>
                <p className="text-2xl font-bold text-purple-600">{archiveData.summary.successRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  const OperationsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث في العمليات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <EnhancedButton
          variant="primary"
          icon={<Download className="w-4 h-4" />}
        >
          تصدير
        </EnhancedButton>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {archiveData.operations.map((operation) => (
          <Card key={operation.id} className="border-0 shadow-lg">
            <CardBody className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{operation.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {operation.date} - {operation.time} | {operation.distributor}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-gray-600">الطلبات: {operation.orders}</span>
                    <span className="text-green-600 font-medium">€{operation.revenue}</span>
                    <span className="text-gray-600">{operation.duration}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  operation.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {operation.status === 'completed' ? 'مكتمل' : 'معلق'}
                </span>
              </div>
              {operation.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                  <strong>ملاحظات:</strong> {operation.notes}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );

  const ReportsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث في التقارير..."
              className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="all">جميع الأنواع</option>
            <option value="daily">تقارير يومية</option>
            <option value="weekly">تقارير أسبوعية</option>
            <option value="monthly">تقارير شهرية</option>
          </select>
        </div>
        <EnhancedButton variant="primary" icon={<Plus className="w-4 h-4" />}>
          تقرير جديد
        </EnhancedButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            id: 1,
            name: "التقرير اليومي - 15 يناير 2024",
            type: "daily",
            date: "2024-01-15",
            size: "1.2 MB",
            status: "available",
            downloads: 12,
            category: "توزيع"
          },
          {
            id: 2,
            name: "التقرير الأسبوعي - الأسبوع الثاني",
            type: "weekly",
            date: "2024-01-14",
            size: "3.8 MB",
            status: "available",
            downloads: 24,
            category: "تحليلات"
          },
          {
            id: 3,
            name: "تقرير أداء الموزعين - يناير",
            type: "monthly",
            date: "2024-01-31",
            size: "5.2 MB",
            status: "processing",
            downloads: 0,
            category: "أداء"
          },
          {
            id: 4,
            name: "تقرير الإيرادات الشهرية",
            type: "monthly",
            date: "2024-01-31",
            size: "2.1 MB",
            status: "available",
            downloads: 45,
            category: "مالي"
          },
          {
            id: 5,
            name: "تحليل رضا العملاء - Q1",
            type: "quarterly",
            date: "2024-03-31",
            size: "4.7 MB",
            status: "available",
            downloads: 18,
            category: "عملاء"
          },
          {
            id: 6,
            name: "تقرير كفاءة المسارات",
            type: "weekly",
            date: "2024-01-20",
            size: "1.8 MB",
            status: "available",
            downloads: 8,
            category: "مسارات"
          }
        ].map((report) => (
          <Card key={report.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardBody className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center ml-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.type === 'daily' ? 'bg-green-100 text-green-800' :
                      report.type === 'weekly' ? 'bg-blue-100 text-blue-800' :
                      report.type === 'monthly' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {report.type === 'daily' ? 'يومي' :
                       report.type === 'weekly' ? 'أسبوعي' :
                       report.type === 'monthly' ? 'شهري' : 'ربع سنوي'}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  report.status === 'available' ? 'bg-green-100 text-green-800' :
                  report.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {report.status === 'available' ? 'متاح' :
                   report.status === 'processing' ? 'قيد المعالجة' : 'خطأ'}
                </span>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">{report.name}</h4>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center justify-between">
                  <span>التاريخ:</span>
                  <span>{report.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>الحجم:</span>
                  <span>{report.size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>التنزيلات:</span>
                  <span>{report.downloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>الفئة:</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{report.category}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <EnhancedButton
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  icon={<Download className="w-4 h-4" />}
                  disabled={report.status !== 'available'}
                >
                  تحميل
                </EnhancedButton>
                <EnhancedButton
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  icon={<Eye className="w-4 h-4" />}
                  disabled={report.status !== 'available'}
                >
                  معاينة
                </EnhancedButton>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );

  const AnalyticsSection = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">متوسط زمن التوصيل</p>
                <p className="text-2xl font-bold text-blue-600">42 دقيقة</p>
                <p className="text-xs text-green-600 font-medium">تحسن بـ 8%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">كفاءة المسارات</p>
                <p className="text-2xl font-bold text-green-600">91.2%</p>
                <p className="text-xs text-green-600 font-medium">تحسن بـ 3%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">رضا العملاء</p>
                <p className="text-2xl font-bold text-purple-600">4.3/5</p>
                <p className="text-xs text-green-600 font-medium">+0.2 نقطة</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">معدل توفير التكاليف</p>
                <p className="text-2xl font-bold text-orange-600">15.3%</p>
                <p className="text-xs text-green-600 font-medium">+2.1%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Euro className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-600 ml-2" />
              اتجاهات الأداء الشهرية
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              {[
                { month: "يناير", efficiency: 91, orders: 1380, revenue: 87650 },
                { month: "ديسمبر", efficiency: 88, orders: 1245, revenue: 79820 },
                { month: "نوفمبر", efficiency: 86, orders: 1180, revenue: 75400 },
                { month: "أكتوبر", efficiency: 89, orders: 1220, revenue: 78200 }
              ].map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{data.month}</p>
                    <p className="text-sm text-gray-600">{data.orders} طلب</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-600">{data.efficiency}%</p>
                    <p className="text-xs text-gray-600">كفاءة</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-green-600">€{data.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">إيرادات</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Users className="w-5 h-5 text-green-600 ml-2" />
              تحليل أداء الموزعين
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              {[
                { name: "أحمد محمد", score: 96, trend: "up", change: "+3%" },
                { name: "سارة أحمد", score: 92, trend: "up", change: "+1%" },
                { name: "محمد علي", score: 94, trend: "stable", change: "0%" },
                { name: "فاطمة حسن", score: 89, trend: "down", change: "-2%" }
              ].map((distributor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-3">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{distributor.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">{distributor.score}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      distributor.trend === 'up' ? 'bg-green-100 text-green-800' :
                      distributor.trend === 'down' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {distributor.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Database className="w-5 h-5 text-purple-600 ml-2" />
            تحليلات متقدمة
          </h3>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">التنبؤ بالطلب</h4>
              <p className="text-2xl font-bold text-purple-600 mb-1">+12%</p>
              <p className="text-sm text-gray-600">زيادة متوقعة الشهر القادم</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">تحسين المسارات</h4>
              <p className="text-2xl font-bold text-indigo-600 mb-1">18 دقيقة</p>
              <p className="text-sm text-gray-600">متوسط التوفير في الوقت</p>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">كفاءة الطاقة</h4>
              <p className="text-2xl font-bold text-cyan-600 mb-1">-23%</p>
              <p className="text-sm text-gray-600">تقليل استهلاك الوقود</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <EnhancedButton
              variant="primary"
              icon={<Settings className="w-4 h-4" />}
            >
              إعدادات التحليلات المتقدمة
            </EnhancedButton>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Archive className="w-6 h-6 text-blue-600 ml-2" />
            نظام الأرشيف والعمليات
          </h2>
          <p className="text-gray-600 mt-1">أرشيف شامل لجميع العمليات والتقارير</p>
        </div>
        <EnhancedButton
          onClick={loadArchiveData}
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
        >
          تحديث
        </EnhancedButton>
      </div>

      <Card className="border-0 shadow-lg">
        <div className="flex overflow-x-auto">
          {archiveSections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeSection === section.key
                  ? "text-blue-600 border-blue-600 bg-blue-50"
                  : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <section.icon className="w-4 h-4 ml-2" />
              {section.label}
            </button>
          ))}
        </div>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 ml-3" />
              <span className="text-gray-600">جاري تحميل البيانات...</span>
            </div>
          ) : (
            <>
              {activeSection === "overview" && <OverviewSection />}
              {activeSection === "operations" && <OperationsSection />}
              {activeSection === "reports" && <ReportsSection />}
              {activeSection === "analytics" && <AnalyticsSection />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ArchiveSystem; 