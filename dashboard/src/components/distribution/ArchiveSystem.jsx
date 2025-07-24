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
  Settings
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
              {activeSection === "reports" && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">التقارير المحفوظة</h3>
                  <p className="text-gray-600">قيد التطوير...</p>
                </div>
              )}
              {activeSection === "analytics" && (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">تحليلات متقدمة</h3>
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

export default ArchiveSystem; 