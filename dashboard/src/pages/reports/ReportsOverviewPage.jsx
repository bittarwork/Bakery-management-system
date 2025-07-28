import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Construction, Clock } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";

const ReportsOverviewPage = () => {
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
          </div>
        </div>
      </motion.div>

      {/* Development Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardBody className="text-center py-16">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Construction className="w-24 h-24 text-orange-500" />
                  <div className="absolute -top-2 -right-2">
                    <Clock className="w-8 h-8 text-yellow-600 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                قسم التقارير المتقدمة
              </h2>
              
              <div className="bg-orange-100 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-orange-800 mb-3">
                  🚧 جاري التطوير 🚧
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  نعمل حالياً على تطوير نظام تقارير متقدم وشامل سيشمل:
                </p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-2">📊 تقارير المبيعات</h4>
                    <p className="text-sm text-gray-600">تحليلات مفصلة للمبيعات والأرباح</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-2">📈 التحليلات المتقدمة</h4>
                    <p className="text-sm text-gray-600">رؤى ذكية واتجاهات السوق</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-2">🗓️ التقارير الدورية</h4>
                    <p className="text-sm text-gray-600">تقارير يومية وأسبوعية وشهرية</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-2">📋 تقارير مخصصة</h4>
                    <p className="text-sm text-gray-600">إنشاء تقارير حسب الطلب</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-gray-600">
                <p className="text-lg">
                  سيتم إطلاق هذا القسم قريباً مع ميزات متقدمة ولوحة تحكم تفاعلية
                </p>
                <div className="flex justify-center items-center mt-4 text-sm">
                  <Clock className="w-4 h-4 ml-2" />
                  <span>متوقع الإنتهاء: قريباً جداً</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsOverviewPage; 