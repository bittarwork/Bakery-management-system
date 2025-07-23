import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import distributionService from "../../services/distributionService";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Card, CardHeader, CardBody } from "../ui/Card";

const DistributionTripsTable = ({
  filters = {},
  onTripSelect = null,
  className = "",
}) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load trips
  const loadTrips = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await distributionService.getDistributionTrips(filters);

      if (response.success) {
        const formattedTrips = response.data.map((trip) =>
          distributionService.formatTripForDisplay(trip)
        );
        setTrips(formattedTrips);
      } else {
        setError(response.message || "خطأ في جلب رحلات التوزيع");
      }
    } catch (error) {
      console.error("Error loading trips:", error);
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  // Load trips when filters change
  useEffect(() => {
    loadTrips();
  }, [filters]);

  // Get status badge
  const getStatusBadge = (status) => {
    const color = distributionService.getStatusBadgeColor(status);
    const colorClasses = {
      yellow: "bg-yellow-100 text-yellow-800",
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      gray: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colorClasses[color] || colorClasses.gray
        }`}
      >
        {distributionService.getStatusDisplayName(status)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="جاري تحميل رحلات التوزيع..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardBody>
          <div className="text-center py-8">
            <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              خطأ في تحميل البيانات
            </h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={() => loadTrips()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              إعادة المحاولة
            </button>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (trips.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              لا توجد رحلات توزيع
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              لم يتم العثور على رحلات توزيع بالمعايير المحددة
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">رحلات التوزيع</h3>
          <p className="text-sm text-gray-500">إجمالي {trips.length} رحلة</p>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الرحلة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الموزع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المحلات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    القيمة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {trips.map((trip) => (
                    <motion.tr
                      key={trip.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TruckIcon className="h-5 w-5 text-gray-400 ml-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {trip.trip_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {new Date(trip.trip_date).toLocaleDateString("ar-SA")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {trip.distributor_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.completed_stores} / {trip.total_stores}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.formatted_amount_eur}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(trip.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => onTripSelect && onTripSelect(trip)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 ml-1" />
                          عرض
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default DistributionTripsTable;
