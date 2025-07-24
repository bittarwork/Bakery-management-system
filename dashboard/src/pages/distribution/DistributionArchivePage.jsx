import React from "react";
import { motion } from "framer-motion";
import ArchiveSystem from "../../components/distribution/ArchiveSystem";
import BackButton from "../../components/ui/BackButton";

const DistributionArchivePage = () => {
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
                  أرشيف العمليات
                </h1>
                <p className="text-gray-600 mt-1">
                  أرشيف شامل لجميع العمليات والتقارير والتحليلات
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ArchiveSystem />
      </div>
    </div>
  );
};

export default DistributionArchivePage; 