import React from "react";
import { motion } from "framer-motion";
import ReportsSystem from "../../components/distribution/ReportsSystem";
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
                <h1 className="text-2xl font-bold text-gray-900">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ReportsSystem />
      </div>
    </div>
  );
};

export default DistributionReportsPage; 