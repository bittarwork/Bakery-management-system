import React from "react";
import { motion } from "framer-motion";
import DailyOperationsManager from "../../components/distribution/DailyOperationsManager";
import BackButton from "../../components/ui/BackButton";
import { Coffee, Calendar } from "lucide-react";

const DailyOperationsPage = () => {
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
                  <Coffee className="w-7 h-7 text-orange-600 ml-3" />
                  العمليات اليومية
                </h1>
                <p className="text-gray-600 mt-1">
                  إدارة ومتابعة العمليات والمهام اليومية للتوزيع
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-2">
                <Calendar className="w-4 h-4 text-gray-600 ml-2" />
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString("ar-SA")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DailyOperationsManager selectedDate={new Date().toISOString().split("T")[0]} />
      </div>
    </div>
  );
};

export default DailyOperationsPage; 