import React from "react";
import { motion } from "framer-motion";
import { FileText, Construction, Clock, Truck } from "lucide-react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import BackButton from "../../components/ui/BackButton";

const DistributionReportsPage = () => {
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
            <div className="flex items-center">
              <BackButton to="/distribution/manager" />
              <div className="mr-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-7 h-7 text-blue-600 ml-3" />
                  تقارير التوزيع
                </h1>
                <p className="text-gray-600 mt-1">
                  تقارير شاملة لجميع عمليات التوزيع والأداء
                </p>
              </div>
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
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardBody className="text-center py-16">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Truck className="w-24 h-24 text-blue-500" />
                  <div className="absolute -top-2 -right-2">
                    <Clock className="w-8 h-8 text-indigo-600 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                نظام تقارير التوزيع
              </h2>
              
              <div className="bg-blue-100 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">
                  🚛 جاري التطوير 🚛
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  قريباً: نظام تقارير متقدم لمتابعة أداء التوزيع والموزعين
                </p>
              </div>
              
              <div className="mt-8 text-gray-600">
                <p className="text-lg">
                  تقارير شاملة لعمليات التوزيع مع تتبع الأداء
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

export default DistributionReportsPage; 